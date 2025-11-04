// routes/bookings.js
import express from "express";
import { db, transporter } from "../index.js";

const router = express.Router();

// Helper om {{placeholders}} te vervangen
function replacePlaceholders(template, data) {
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] ?? "");
}

// ✅ POST nieuwe boeking
router.post("/", async (req, res) => {
  const { name, email, date, time, people, prijs } = req.body;

  console.log("📩 Ontvangen boeking:", req.body);

  if (!name || !email || !date || !time || !people || prijs == null) {
    return res.status(400).json({ error: "Onvolledige gegevens" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO bookings (name, email, date, time, people, prijs, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [name, email, date, time, people, prijs]
    );

    const bookingId = result.insertId;

    // Mailtemplate ophalen
    const [rows] = await db.execute(
      "SELECT `value` FROM settings WHERE `key` = ?",
      ["booking_email_template"]
    );

    if (!rows.length) {
      return res.status(500).json({ error: "Mailtemplate niet gevonden" });
    }

    let stored = rows[0].value;
    if (typeof stored === "string") {
      try {
        stored = JSON.parse(stored);
      } catch (err) {
        return res.status(500).json({ error: "Ongeldige mailtemplate in DB" });
      }
    }

    const data = { id: bookingId, name, date, time, people, prijs };

    const template = {
      subject: replacePlaceholders(stored.subject || "", data),
      text: replacePlaceholders(stored.text || "", data),
      html: replacePlaceholders(stored.html || "", data),
    };

    let mailError = null;
    try {
      await transporter.sendMail({
        from: `"Bunker Museum" <${process.env.MAIL_USER}>`,
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    } catch (err) {
      mailError = err.message;
    }

    res.json({ id: bookingId, mailError });
  } catch (err) {
    console.error("❌ Onverwachte fout:", err);
    res.status(500).json({ error: "Er is iets misgegaan" });
  }
});

// ✅ GET alle boekingen (optioneel filter: upcoming/past)
router.get("/", async (req, res) => {
  try {
    const filter = req.query.filter;
    let query = "SELECT * FROM bookings";

    if (filter === "upcoming") {
      query += " WHERE CONCAT(date, ' ', time) >= NOW()";
    } else if (filter === "past") {
      query += " WHERE CONCAT(date, ' ', time) < NOW()";
    }

    query += " ORDER BY date, time";
    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Fout bij ophalen boekingen:", err);
    res.status(500).json({ error: "Kon reserveringen niet ophalen" });
  }
});

// ✅ GET boeking per ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute("SELECT * FROM bookings WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Boeking niet gevonden" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Fout bij ophalen boeking:", err);
    res.status(500).json({ error: "Kon boeking niet ophalen" });
  }
});

// ✅ PUT boeking updaten (admin-dashboard)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, date, time, people, prijs } = req.body;

  if (!name || !date || !time || !people || prijs == null) {
    return res.status(400).json({ error: "Onvolledige gegevens" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE bookings SET name = ?, date = ?, time = ?, people = ?, prijs = ? WHERE id = ?",
      [name, date, time, people, prijs, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Boeking niet gevonden" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Fout bij updaten boeking:", err);
    res.status(500).json({ error: "Kon boeking niet updaten" });
  }
});

// ✅ DELETE boeking
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute("DELETE FROM bookings WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Boeking niet gevonden" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Fout bij verwijderen boeking:", err);
    res.status(500).json({ error: "Kon boeking niet verwijderen" });
  }
});

export default router;
