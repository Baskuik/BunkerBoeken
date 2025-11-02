// routes/openingstijden.js
import express from "express";
import { db } from "../index.js";

const router = express.Router();

// ✅ GET – Openingstijden ophalen
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT value FROM settings WHERE `key` = 'openingstijden'");
    if (!rows.length) return res.status(404).json({ error: "Openingstijden niet gevonden" });

    const value = JSON.parse(rows[0].value);
    res.json(value);
  } catch (err) {
    console.error("❌ Fout bij ophalen openingstijden:", err);
    res.status(500).json({ error: "Kon openingstijden niet ophalen" });
  }
});

// ✅ PUT – Openingstijden bijwerken (alleen admin)
router.put("/", async (req, res) => {
  // Controleer of gebruiker admin is
  if (!req.session?.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Niet toegestaan" });
  }

  const updatedTimes = req.body; // verwacht JSON object
  if (!updatedTimes || typeof updatedTimes !== "object") {
    return res.status(400).json({ error: "Ongeldige data" });
  }

  try {
    await db.execute(
      "UPDATE settings SET value = ? WHERE `key` = 'openingstijden'",
      [JSON.stringify(updatedTimes)]
    );
    res.json({ success: true, updatedTimes });
  } catch (err) {
    console.error("❌ Fout bij opslaan openingstijden:", err);
    res.status(500).json({ error: "Kon openingstijden niet opslaan" });
  }
});

export default router;
