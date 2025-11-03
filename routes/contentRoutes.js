// routes/contentRoutes.js
import express from "express";
import { db } from "../index.js";

const router = express.Router();

// Middleware: check admin
function requireAdmin(req, res, next) {
  if (req.session?.role !== "admin") {
    return res.status(403).json({ error: "Geen toegang" });
  }
  next();
}

// Haal content op
router.get("/home", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT value FROM settings WHERE `key` = 'home_content'"
    );
    if (rows.length === 0) return res.json({ content: null });
    res.json({ content: JSON.parse(rows[0].value) });
  } catch (err) {
    console.error("Fout bij ophalen content:", err);
    res.status(500).json({ error: "Kon content niet ophalen" });
  }
});

// Sla content op (admin only)
router.put("/home", requireAdmin, async (req, res) => {
  try {
    const content = JSON.stringify(req.body.content);
    await db.execute(
      "INSERT INTO settings (`key`, `value`) VALUES ('home_content', ?) ON DUPLICATE KEY UPDATE value = ?",
      [content, content]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Fout bij opslaan content:", err);
    res.status(500).json({ error: "Kon content niet opslaan" });
  }
});

export default router;
