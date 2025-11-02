// index.js
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

// ====================
// 1️⃣ CORS MIDDLEWARE
// ====================
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true,                // ✅ dit laat cookies toe cross-origin
}));

// ====================
// 2️⃣ JSON parser
// ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================
// 3️⃣ SESSION MIDDLEWARE
// ====================
app.use(session({
  name: "admin_session",
  secret: process.env.SESSION_SECRET || "dev_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,    // ❌ let op: true = alleen HTTPS, dus false voor localhost
    sameSite: "none", // ✅ laat cookie cross-origin mee sturen
    maxAge: 24 * 60 * 60 * 1000,
  },
}));



// ====================
// 4️⃣ ROUTES
// ====================
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);

// ====================
// 5️⃣ DEBUG ROUTE
// ====================
app.get("/debug/session", (req, res) => {
  res.json({ session: req.session });
});

// ====================
// 6️⃣ TEST ENDPOINT
// ====================
app.get("/", (req, res) => res.send("Server draait!"));

// ====================
// 7️⃣ START SERVER MET DB INIT
// ====================
initDB()
  .then(() => app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`)))
  .catch(err => console.error("DB connectie fout:", err));
