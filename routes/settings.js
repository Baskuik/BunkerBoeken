// routes/settings.js
import express from "express";
import { initDB } from "../db.js";

const router = express.Router();

/**
 * ✅ NIEUW: Haalt ALLE instellingen op (openingstijden, maxpersonen, pricePerDate)
 * GET /api/settings
 */
router.get("/", async (req, res) => {
  const db = await initDB();

  try {
    // Alle settings ophalen
    const [rows] = await db.execute("SELECT `key`, `value` FROM settings");

    // Omzetten naar object
    const allSettings = {};
    for (const row of rows) {
      try {
        allSettings[row.key] = JSON.parse(row.value);
      } catch {
        allSettings[row.key] = row.value;
      }
    }

    // Structuur teruggeven zoals frontend verwacht
    res.json({
      openingstijden: allSettings.openingstijden || {},
      maxpersonen: allSettings.maxpersonen || {},
      pricePerDate: allSettings.pricePerDate || {},
    });
  } catch (err) {
    console.error("❌ Fout bij ophalen van ALLE settings:", err);
    res.status(500).json({ error: "Fout bij ophalen instellingen" });
  }
});

/**
 * GET /api/settings/:key
 * Haalt één specifieke instelling op uit de database.
 */
router.get("/:key", async (req, res) => {
  const db = await initDB();
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
 * Maakt of update een instelling in de database.
 */
router.put("/:key", async (req, res) => {
  const db = await initDB();
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
