import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mysql from "mysql2";
import session from "express-session";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser
app.use(express.json());

// Session
app.use(
  session({
    name: "admin_session",
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24, sameSite: "lax", secure: false },
  })
);

// CORS
const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => (!origin || whitelist.includes(origin) ? callback(null, true) : callback(new Error("Not allowed by CORS"))),
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

// --- MySQL setup ---
let db = null;
const rootDb = mysql.createConnection({ host: "localhost", user: "root", password: "", multipleStatements: true });

rootDb.connect(err => {
  if (err) { console.error("MySQL root connection error:", err); process.exit(1); }
  console.log("Connected to MySQL as root");

  const createDbAndTables = `
    CREATE DATABASE IF NOT EXISTS bunkerboeken CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE bunkerboeken;
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(10) NOT NULL,
      people INT NOT NULL,
      prijs DECIMAL(6,2) DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_date_time (date, time)
    );
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  rootDb.query(createDbAndTables, err => {
    if (err) { console.error("Error creating database/tables:", err); process.exit(1); }
    console.log("Database and tables ready");

    db = mysql.createConnection({ host: "localhost", user: "root", password: "", database: "bunkerboeken" });
    db.connect(err => {
      if (err) { console.error("DB connection error:", err); process.exit(1); }
      console.log("Connected to bunkerboeken database");
    });
  });
});

// --- Nodemailer transporter ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

// --- BOOKINGS ROUTE ---
app.post("/api/bookings", (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not ready" });

  const { name, email, date, time, people, prijs } = req.body;
  if (!name || !email || !date || !time || !people) return res.status(400).json({ error: "Invalid booking data" });

  const peopleNum = Number(people);
  const totalPrice = Number(prijs) || peopleNum * 10;

  if (!Number.isInteger(peopleNum) || peopleNum < 1 || peopleNum > 12) return res.status(400).json({ error: "Invalid people count" });

  // Check date+time availability
  db.query("SELECT id FROM bookings WHERE date=? AND time=? LIMIT 1", [date, time], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (rows.length) return res.status(409).json({ error: "Deze tijd op deze datum is al geboekt" });

    // Insert booking
    const insertSql = "INSERT INTO bookings (name,email,date,time,people,prijs,created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())";
    db.query(insertSql, [name.trim(), email.trim(), date, time, peopleNum, totalPrice], async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const bookingId = result.insertId;
      const createdAt = new Date().toISOString();

      // Send confirmation mail
      const mailHtml = `
        <h2>Bevestiging boeking</h2>
        <p><b>Bevestigingsnummer:</b> ${bookingId}</p>
        <p><b>Naam:</b> ${name}</p>
        <p><b>E-mail:</b> ${email}</p>
        <p><b>Datum:</b> ${date}</p>
        <p><b>Tijd:</b> ${time}</p>
        <p><b>Aantal personen:</b> ${peopleNum}</p>
        <p><b>Totaal prijs:</b> €${totalPrice}</p>
        <p><b>Gemaakt op:</b> ${createdAt}</p>
        <h3>Locatie</h3>
        <p>Bunker Museum, Hoofdstraat 1, 1234 AB, Plaatsnaam</p>
      `;

      try {
        await transporter.sendMail({
          from: `"Bunker Museum" <${process.env.MAIL_USER}>`,
          to: email,
          subject: `Bevestiging boeking #${bookingId}`,
          html: mailHtml,
        });
        console.log(`✅ Mail sent to ${email}`);
      } catch (mailErr) {
        console.error("❌ Fout bij verzenden mail:", mailErr);
      }

      res.json({ id: bookingId, name, email, date, time, people: peopleNum, prijs: totalPrice, created_at: createdAt });
    });
  });
});

// --- GET booking by id ---
app.get("/api/bookings/:id", (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not ready" });
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid id" });

  db.query("SELECT id,name,email,DATE_FORMAT(date,'%Y-%m-%d') AS date,time,people,prijs,created_at FROM bookings WHERE id=?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB select error" });
    if (!rows.length) return res.status(404).json({ error: "Booking not found" });
    res.json(rows[0]);
  });
});

// --- AUTH endpoints blijven hetzelfde --- (login, logout, /me)

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
