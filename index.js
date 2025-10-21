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
    console.error("❌ DB error:", err);
  } else {
    console.log("✅ Verbonden met MySQL");
  }
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

app.listen(5000, () => console.log("🚀 Server gestart op http://localhost:5000"));
