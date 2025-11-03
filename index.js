// index.js (backend)
import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import settingsRoutes from "./routes/settings.js";
import bookingsRoutes from "./routes/bookings.js"; // ✅ toegevoegd
import { initDB } from "./db.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// ✅ Database initialiseren
let db;
initDB()
  .then(conn => {
    db = conn;
    console.log("✅ Verbonden met database");
  })
  .catch(err => console.error("❌ DB connectie fout:", err));

// ✅ Nodemailer transporter (voor e-mails)
export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ✅ Database exporteren zodat andere routes hem kunnen gebruiken
export { db };

// ===== Middleware =====

// CORS
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

// JSON parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION
app.use(
  session({
    name: "admin_session",
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 uur
    },
  })
);

// ===== Routes =====
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/bookings", bookingsRoutes); // ✅ toegevoegd

// ===== Debug Routes =====
app.get("/debug/session", (req, res) => {
  res.json({ session: req.session });
});

app.get("/debug/check-session", (req, res) => {
  console.log("SESSION OP CHECK-ROUTE:", req.session);
  res.json({ session: req.session });
});

// ===== Test Route =====
app.get("/", (req, res) => res.send("Server draait!"));

// ===== Start Server =====
app.listen(PORT, () => console.log(`🚀 Server draait op poort ${PORT}`));
