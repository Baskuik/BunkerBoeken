// routes/settings.js
import express from "express";
import { initDB } from "../db.js";

const router = express.Router();

/**
 * GET /api/settings/:key
 * Haalt een setting op uit de database.
 */
router.get("/:key", async (req, res) => {
  const db = await initDB(); // ✅ verbinding ophalen
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

    // Probeer JSON te parsen
    try {
      value = JSON.parse(value);
    } catch {
      // fallback: laat value zoals het is
    }

    res.json({ key, value });
  } catch (err) {
    console.error("❌ Fout bij ophalen setting:", err);
    res.status(500).json({ error: "Kan niet ophalen" });
  }
});

/**
 * PUT /api/settings/:key
 * Maakt of update een setting in de database.
 */
router.put("/:key", async (req, res) => {
  const db = await initDB(); // ✅ verbinding ophalen
  const { key } = req.params;
  const { value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ error: "Key of value ontbreekt" });
  }

  // Speciale validatie voor openingstijden
  if (key === "openingstijden") {
    const dagen = [
      "maandag",
      "dinsdag",
      "woensdag",
      "donderdag",
      "vrijdag",
      "zaterdag",
      "zondag",
    ];

    for (const dag of dagen) {
      if (!Array.isArray(value[dag])) {
        return res
          .status(400)
          .json({ error: `Ongeldige tijden voor dag '${dag}'` });
      }
    }
  } else if (typeof value !== "object") {
    // Algemeen geval: verwacht een object
    return res.status(400).json({ error: "Ongeldige value (verwacht object)" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT 1 FROM settings WHERE `key` = ?",
      [key]
    );

    const stringifiedValue = JSON.stringify(value);

    if (!rows.length) {
      await db.execute(
        "INSERT INTO settings (`key`, `value`) VALUES (?, ?)",
        [key, stringifiedValue]
      );
    } else {
      await db.execute(
        "UPDATE settings SET `value` = ? WHERE `key` = ?",
        [stringifiedValue, key]
      );
    }

    res.json({ success: true, key, value });
  } catch (err) {
    console.error("❌ Fout bij opslaan setting:", err);
    res.status(500).json({ error: "Kon niet opslaan" });
  }
});

export default router;
