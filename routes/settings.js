import express from "express";
import { db } from "../index.js";

const router = express.Router();

/**
 * GET /api/settings/:key
 * Haalt een setting op uit de database.
 */
router.get("/:key", async (req, res) => {
  const { key } = req.params;
  try {
    const [rows] = await db.execute(
      "SELECT `value` FROM settings WHERE `key` = ?",
      [key]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Key niet gevonden" });
    }

    let value = rows[0].value;

    // Probeer JSON automatisch te parsen, maar val terug op de ruwe string
    try {
      value = JSON.parse(value);
    } catch {
      // laat value zoals het is
    }

    res.json({ value });
  } catch (err) {
    console.error("❌ Fout bij ophalen template:", err);
    res.status(500).json({ error: "Kan niet ophalen" });
  }
});

/**
 * PUT /api/settings/:key
 * Maakt of update een setting in de database.
 */
router.put("/:key", async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value || typeof value !== "object") {
    return res.status(400).json({ error: "Ongeldige value (verwacht object)" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT 1 FROM settings WHERE `key` = ?",
      [key]
    );

    const stringifiedValue = JSON.stringify(value);

    if (!rows.length) {
      // Nieuwe rij toevoegen
      await db.execute(
        "INSERT INTO settings (`key`, `value`) VALUES (?, ?)",
        [key, stringifiedValue]
      );
    } else {
      // Bestaande rij updaten
      await db.execute(
        "UPDATE settings SET `value` = ? WHERE `key` = ?",
        [stringifiedValue, key]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Fout bij opslaan template:", err);
    res.status(500).json({ error: "Kon niet opslaan" });
  }
});

export default router;
