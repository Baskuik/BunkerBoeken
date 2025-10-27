import express from "express";
import cors from "cors";
import mysql from "mysql";
import session from "express-session";

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

// Session (keep as before if you need it)
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
    // allow requests with no origin (curl, postman) or from whitelist
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

// --- MySQL connection and DB/table setup ---
// connect without a database first so we can create it if missing
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

  // create database if missing, then ensure table exists
  const createDbAndTable = `
    CREATE DATABASE IF NOT EXISTS bunkerboeken CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE bunkerboeken;
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(10) NOT NULL,
      people INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  rootDb.query(createDbAndTable, (err) => {
    if (err) {
      console.error("Error creating database/table:", err);
      process.exit(1);
    }
    console.log("Database and bookings table ready");

    // switch to a connection bound to the database for regular queries
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
    });
  });
});

// keep db variable for handlers; will be set after DB init
let db = null;

// If rootDb setup finished quickly, db will be assigned in callback above.
// To be safe, poll until db is set for route handlers (simple guard used below).

// POST /api/bookings - insert booking
app.post("/api/bookings", (req, res) => {
  // guard if db not ready yet
  if (!db) {
    console.warn("DB not ready yet");
    return res.status(503).json({ error: "Database not ready" });
  }

  console.log("POST /api/bookings body:", req.body);
  const { name, email, date, time, people } = req.body || {};

  // server-side validation
  if (
    !name ||
    !email ||
    !date ||
    !time ||
    people === undefined ||
    people === null ||
    typeof name !== "string" ||
    typeof email !== "string"
  ) {
    console.log("Validation failed:", { name, email, date, time, people });
    return res.status(400).json({ error: "Invalid booking data" });
  }

  // optional: basic email format check
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const peopleNum = Number(people);
  if (!Number.isInteger(peopleNum) || peopleNum < 1 || peopleNum > 12) {
    return res.status(400).json({ error: "Invalid people count" });
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

// GET booking by id
app.get("/api/bookings/:id", (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Database not ready" });
  }
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid id" });
  }
  db.query("SELECT id, name, email, DATE_FORMAT(date, '%Y-%m-%d') AS date, time, people, created_at FROM bookings WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("DB select error:", err);
      return res.status(500).json({ error: "Failed to fetch booking" });
    }
    if (!rows.length) return res.status(404).json({ error: "Booking not found" });
    res.json(rows[0]);
  });
});

// health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
