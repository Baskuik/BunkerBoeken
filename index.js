// index.js (achterkant)
import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import settingsRoutes from "./routes/settings.js";
import { initDB } from "./db.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// CORS
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));

// JSON parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION
app.use(session({
  name: "admin_session",
  secret: process.env.SESSION_SECRET || "dev_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// ROUTES
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);

// DEBUG ROUTES
app.get("/debug/session", (req, res) => {
  res.json({ session: req.session });
});

// ✅ Nieuwe debug-route voor sessie check
app.get("/debug/check-session", (req, res) => {
  console.log("SESSION OP CHECK-ROUTE:", req.session);
  res.json({ session: req.session });
});

// TEST
app.get("/", (req, res) => res.send("Server draait!"));

// START SERVER
initDB()
  .then(() => app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`)))
  .catch(err => console.error("DB connectie fout:", err));
