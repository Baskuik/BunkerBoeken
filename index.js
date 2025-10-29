import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// DATABASE
const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "rondleidingen",
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Helper: get / set settings
async function getSetting(key) {
  const [rows] = await db.query("SELECT value FROM settings WHERE `key` = ?", [
    key,
  ]);
  if (rows.length === 0) return null;
  try {
    return JSON.parse(rows[0].value);
  } catch {
    return rows[0].value;
  }
}

async function setSetting(key, value) {
  const val =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
  await db.query(
    "INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
    [key, val]
  );
}

// CORS and session configuration
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests from same-origin tools (no origin) and the client origin
    if (!origin || origin === CLIENT_ORIGIN) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));



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

// ✅ ROUTES koppelen
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);


// ROUTES
// Get single setting
app.get("/api/settings/:key", async (req, res) => {
  try {
    const value = await getSetting(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load setting" });
  }
});

// Get all settings
app.get("/api/settings/all", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT `key`, `value` FROM settings");
    const settings = {};
    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update setting
app.put("/api/settings/:key", async (req, res) => {
  try {
    await setSetting(req.params.key, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save setting" });
  }
});

// BOOKINGS (simplified)
app.post("/api/bookings", async (req, res) => {
  const { name, email, date, time, peopleNum } = req.body;

  try {
    const prices = (await getSetting("prices")) || [];
    const basePrice = prices.find(
      (p) => p.weekday === new Date(date).getDay() || p.weekday === "all"
    );
    const pricePerPerson = basePrice?.price || 10;
    const totalPrice = pricePerPerson * peopleNum;

    // Save booking
    const [insertResult] = await db.query(
      "INSERT INTO bookings (name, email, date, time, people, total_price) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, date, time, peopleNum, totalPrice]
    );

    // Send confirmation email
    try {
      const emailTemplate = await getSetting("emailTemplate");
      if (emailTemplate && transporter) {
        const html = emailTemplate
          .replace(/\{\{name\}\}/g, name)
          .replace(/\{\{date\}\}/g, date)
          .replace(/\{\{time\}\}/g, time)
          .replace(/\{\{people\}\}/g, peopleNum)
          .replace(/\{\{price\}\}/g, totalPrice.toFixed(2));

        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: "Bevestiging rondleiding",
          html,
        });
      }
    } catch (mailErr) {
      console.error("Email send failed:", mailErr);
    }

    res.status(201).json({
      success: true,
      id: insertResult.insertId,
      totalPrice,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Boeking mislukt" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server draait op poort ${PORT}`));
