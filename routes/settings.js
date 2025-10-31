import express from "express";
import { db } from "../index.js";
const router = express.Router();

// GET template
router.get("/:key", async (req, res) => {
  const { key } = req.params;
  try {
    const [rows] = await db.execute(
      "SELECT `value` FROM settings WHERE `key` = ?",
      [key]
    );
    if (!rows.length) return res.status(404).json({ error: "Key niet gevonden" });
    res.json({ value: rows[0].value }); // JSON object direct
  } catch (err) {
    console.error("❌ Fout bij ophalen template:", err);
    res.status(500).json({ error: "Kan niet ophalen" });
  }
});

// PUT template
router.put("/:key", async (req, res) => {
  const { key } = req.params;
  const { value } = req.body; // JSON object
  if (!value || typeof value !== "object") {
    return res.status(400).json({ error: "Ongeldige value" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT 1 FROM settings WHERE `key` = ?",
      [key]
    );
    if (!rows.length) {
      await db.execute(
        "INSERT INTO settings (`key`, `value`) VALUES (?, ?)",
        [key, value]
      );
    } else {
      await db.execute(
        "UPDATE settings SET `value` = ? WHERE `key` = ?",
        [value, key]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Fout bij opslaan template:", err);
    res.status(500).json({ error: "Kon niet opslaan" });
  }
});

export default router;
