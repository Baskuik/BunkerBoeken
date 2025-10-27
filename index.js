// index.js
import express from "express";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import session from "express-session";
import cors from "cors";

const app = express();

console.log("Starting server script...");

// global error handlers to surface crashes in terminal
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

// Body parser
app.use(express.json());

// Session setup
app.use(
  session({
    name: "admin_session",
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "lax",
      secure: false,
    },
  })
);

// CORS setup - whitelist en echo origin (geen wildcard)
const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS check origin:", origin);
    if (!origin) return callback(null, true);
    if (whitelist.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn("Blocked CORS origin:", origin);
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

// Database connectie
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bunkerboeken",
});

db.connect((err) => {
  if (err) {
    console.error("DB connect error:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL");

  // ensure bookings table exists
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(10) NOT NULL,
      people INT NOT NULL,
      created_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  db.query(createTableSql, (err) => {
    if (err) console.error("Create bookings table error:", err);
    else console.log("Bookings table ready");
  });
});

// Login route
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("DB query error:", err);
      return res.status(500).json({ message: "Serverfout" });
    }
    if (results.length === 0) return res.status(401).json({ message: "Ongeldige inloggegevens" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Ongeldige inloggegevens" });
    if (user.role !== "admin") return res.status(403).json({ message: "Geen toegang" });

    req.session.adminId = user.id;
    req.session.adminEmail = user.email;

    res.json({ message: "Inloggen gelukt!" });
  });
});

// Endpoint om te checken of ingelogd
app.get("/api/me", (req, res) => {
  if (req.session && req.session.adminId) {
    res.json({ adminId: req.session.adminId, email: req.session.adminEmail });
  } else {
    res.status(401).json({ message: "Niet ingelogd" });
  }
});

// Logout route - vernietig sessie en clear cookie
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Kon niet uitloggen" });
    }
    // clear cookie (naam komt uit session config)
    res.clearCookie("admin_session", { path: "/" });
    return res.json({ message: "Uitgelogd" });
  });
});

// POST endpoint to save a booking
app.post("/api/bookings", (req, res) => {
  console.log("POST /api/bookings body:", req.body);
  const { name, email, date, time, people } = req.body || {};
  if (!name || !email || !date || !time || !people) {
    console.log("Validation failed:", { name, email, date, time, people });
    return res.status(400).json({ error: "Invalid booking data" });
  }
  const insertSql =
    "INSERT INTO bookings (name, email, date, time, people, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
  db.query(insertSql, [name.trim(), email.trim(), date, time, Number(people)], (err, result) => {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ error: "Failed to save booking", details: err.message });
    }
    console.log("Inserted booking id:", result.insertId);
    res.json({ id: result.insertId });
  });
});

// GET endpoint to fetch booking by id
app.get("/api/bookings/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid id" });

  db.query("SELECT id, name, email, date, time, people, created_at FROM bookings WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("Fetch booking error:", err);
      return res.status(500).json({ error: "Failed to fetch booking" });
    }
    if (!rows.length) return res.status(404).json({ error: "Booking not found" });
    res.json(rows[0]);
  });
});

app.listen(5000, () => console.log("🚀 Server gestart op http://localhost:5000"));
