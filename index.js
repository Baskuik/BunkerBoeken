import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

// Routers
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookings.js"; // <-- toegevoegd

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// Database
export const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "bunkerboeken",
});
console.log("Connected to database.");

// Nodemailer
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Session & CORS
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  session({
    name: process.env.SESSION_NAME || "admin_session",
    secret: process.env.SESSION_SECRET || "dev_change_this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// API routes
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api/bookings", bookingRoutes); // <-- bookings route toegevoegd

// SETTINGS
app.put("/api/settings/:key", async (req, res) => {
  try {
    const { value } = req.body;
    if (!req.params.key) return res.status(400).json({ error: "Geen key opgegeven" });
    const valToStore = typeof value === "string" ? value : JSON.stringify(value);
    await db.query(
      "INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
      [req.params.key, valToStore]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon settings niet opslaan" });
  }
});

// React frontend
app.use(express.static(path.join(__dirname, "client", "build")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`✅ Server draait op poort ${PORT}`));
