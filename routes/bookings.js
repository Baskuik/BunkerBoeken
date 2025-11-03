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
    // 1️⃣ Opslaan in DB
    const [result] = await db.execute(
      "INSERT INTO bookings (name, email, date, time, people, prijs, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [name, email, date, time, people, prijs]
    );

    const bookingId = result.insertId;
    console.log("✅ Insert succesvol, ID:", bookingId);

    // 2️⃣ Haal mailtemplate uit DB
    const [rows] = await db.execute(
      "SELECT `value` FROM settings WHERE `key` = ?",
      ["booking_email_template"]
    );

    if (!rows.length) {
      console.error("❌ Template 'booking_email_template' niet gevonden in DB");
      return res.status(500).json({ error: "Mailtemplate niet gevonden" });
    }

    let stored = rows[0].value;
    if (typeof stored === "string") {
      try {
        stored = JSON.parse(stored);
      } catch (err) {
        console.error("❌ Ongeldige JSON in DB template:", err);
        return res.status(500).json({ error: "Ongeldige mailtemplate in DB" });
      }
    }

    const data = { id: bookingId, name, date, time, people, prijs };

    const template = {
      subject: replacePlaceholders(stored.subject || "", data),
      text: replacePlaceholders(stored.text || "", data),
      html: replacePlaceholders(stored.html || "", data),
    };

    console.log("📧 Gebruikte mailtemplate:", template);

    // 3️⃣ Verstuur mail
    let mailError = null;
    try {
      const info = await transporter.sendMail({
        from: `"Bunker Museum" <${process.env.MAIL_USER}>`,
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      console.log("✅ Mail verzonden:", info.messageId);
    } catch (err) {
      console.error("❌ Fout bij verzenden mail:", err);
      mailError = err.message;
    }

    // 4️⃣ Response terug
    res.json({ id: bookingId, mailError });
  } catch (err) {
    console.error("❌ Onverwachte fout:", err);
    res.status(500).json({ error: "Er is iets misgegaan" });
  }
});

// ✅ GET boeking per ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute("SELECT * FROM bookings WHERE id = ?", [id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Boeking niet gevonden" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Fout bij ophalen boeking:", err);
    res.status(500).json({ error: "Kon boeking niet ophalen" });
  }
});

export default router;
