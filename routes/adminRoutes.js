// routes/adminRoutes.js
import express from "express";
import { isAdminLoggedIn } from "../middleware/adminMiddleware.js";
import { initDB } from "../db.js";

const router = express.Router();

// Middleware admin check
router.use(isAdminLoggedIn);

// GET waarde van een setting
router.get("/settings/:key", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const { key } = req.params;
  try {
    const db = await initDB(); // ✅ DB verbinding ophalen
    const [rows] = await db.execute(
      "SELECT `value` FROM settings WHERE `key` = ?",
      [key]
    );

    if (rows.length === 0) {
      return res.json({ key, value: { subject: "", text: "", html: "" } });
    }

    let valueParsed;
    try {
      valueParsed = JSON.parse(rows[0].value);
    } catch {
      valueParsed = { subject: "", text: rows[0].value || "", html: rows[0].value || "" };
    }

    res.json({ key, value: valueParsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon setting niet ophalen" });
  }
});

// PUT waarde van een setting
router.put("/settings/:key", async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!key || value === undefined)
    return res.status(400).json({ error: "Key of value ontbreekt" });

  try {
    const db = await initDB(); // ✅ DB verbinding ophalen
    const valToStore = JSON.stringify(value);
    await db.execute(
      "INSERT INTO settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)",
      [key, valToStore]
    );

    res.json({ success: true, key, value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon setting niet opslaan" });
  }
});

// ✅ Huidige ingelogde admin
router.get("/me", async (req, res) => {
  try {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Niet ingelogd als admin" });
    }

    const db = await initDB(); // ✅ DB verbinding ophalen
    const [rows] = await db.execute(
      "SELECT id, email, role FROM users WHERE id = ?",
      [req.session.adminId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Admin niet gevonden" });

    res.json({ adminId: rows[0].id, email: rows[0].email, role: rows[0].role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon admin info niet ophalen" });
  }
});

export default router;
