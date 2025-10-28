import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mysql from "mysql2";
import session from "express-session";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log("Starting server script...");

// basic error handlers
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

// Body parser
app.use(express.json());

// Session
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

// CORS setup for your React dev server
const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

// keep db variable for handlers; will be set after DB init
let db = null;

// --- MySQL connection and DB/table setup ---
const rootDb = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  multipleStatements: true,
});

rootDb.connect((err) => {
  if (err) {
    console.error("MySQL root connection error:", err);
    process.exit(1);
  }
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
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_date_time (date, time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    
    -- Ensure unique index exists even if table already created without it
    SET @ix := (SELECT COUNT(1) FROM information_schema.STATISTICS 
                WHERE table_schema = 'bunkerboeken' AND table_name = 'bookings' AND index_name = 'uniq_date_time');
    SET @sql := IF(@ix = 0, 'ALTER TABLE bookings ADD UNIQUE KEY uniq_date_time (date, time)', 'SELECT 1');
    PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  `;
  rootDb.query(createDbAndTables, (err) => {
    if (err) {
      console.error("Error creating database/tables:", err);
      process.exit(1);
    }
    console.log("Database and tables ready");

    db = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "bunkerboeken",
    });
    db.connect((err) => {
      if (err) {
        console.error("DB (bunkerboeken) connection error:", err);
        process.exit(1);
      }
      console.log("Connected to bunkerboeken database");
      console.log("Skipping automatic default admin creation");
    });
  });
});

// ----------------- ✅ BOOKING + MAIL -----------------
app.post("/api/bookings", async (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not ready" });

  console.log("POST /api/bookings body:", req.body);
  const { name, email, date, time, people } = req.body || {};

  if (!name || !email || !date || !time || people === undefined) {
    return res.status(400).json({ error: "Invalid booking data" });
  }

  const peopleNum = Number(people);
  if (!Number.isInteger(peopleNum) || peopleNum < 1 || peopleNum > 12) {
    return res.status(400).json({ error: "Invalid people count" });
  }

  // check if the selected date+time is already booked
  const checkSql = "SELECT id FROM bookings WHERE date = ? AND time = ? LIMIT 1";
  db.query(checkSql, [date, time], (checkErr, rows) => {
    if (checkErr) {
      console.error("DB check error:", checkErr);
      return res.status(500).json({ error: "Failed to check availability" });
    }
    if (rows && rows.length > 0) {
      return res.status(409).json({ error: "Deze tijd op deze datum is al geboekt" });
    }

    const insertSql =
      "INSERT INTO bookings (name, email, date, time, people, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    db.query(insertSql, [name.trim(), email.trim(), date, time, peopleNum], (err, result) => {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ error: "Failed to save booking", details: err.message });
      }
      console.log("Inserted booking id:", result.insertId);
      // return the new id
      res.json({ id: result.insertId });
    });
  });
});

// ----------------------------------------------------

// GET booking by id
app.get("/api/bookings/:id", (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not ready" });
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid id" });
  db.query(
    "SELECT id, name, email, DATE_FORMAT(date, '%Y-%m-%d') AS date, time, people, created_at FROM bookings WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("DB select error:", err);
        return res.status(500).json({ error: "Failed to fetch booking" });
      }
      if (!rows.length) return res.status(404).json({ error: "Booking not found" });
      res.json(rows[0]);
    }
  );
});

// --- AUTH ENDPOINTS ---
app.post("/api/login", (req, res) => {
  if (!db) return res.status(503).json({ message: "Database not ready" });
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email of wachtwoord is niet ingevuld" });

  db.query("SELECT id, email, password, role FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("DB query error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (!results.length) return res.status(401).json({ message: "Email of wachtwoord is onjuist" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Email of wachtwoord is onjuist" });
    if (user.role !== "admin") return res.status(403).json({ message: "U heeft niet de juiste rechten" });

    req.session.adminId = user.id;
    req.session.adminEmail = user.email;
    req.session.role = user.role;

    res.json({ message: "Succesvol ingelogd" });
  });
});

app.get("/api/me", (req, res) => {
  if (
    !req.session ||
    !req.session.adminId ||
    !req.session.role ||
    req.session.role !== "admin"
  ) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.json({
    adminId: req.session.adminId,
    email: req.session.adminEmail,
    role: req.session.role,
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Uitloggen failed" });
    }
    res.clearCookie("admin_session", { path: "/" });
    return res.json({ message: "Succesvol uitgelogd" });
  });
});

// health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

const server = app.listen(PORT, "0.0.0.0", () => {
  const addr = server.address();
  const host = addr.address === "::" || addr.address === "0.0.0.0" ? "127.0.0.1" : addr.address;
  console.log(`Server listening on http://${host}:${addr.port}`);
});
