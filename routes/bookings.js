// routes/bookings.js
import express from "express";
import { db, transporter } from "../index.js"; 
const router = express.Router();

// POST nieuwe boeking (publiek toegankelijk)
router.post("/", async (req, res) => {
  const { name, email, date, time, people, prijs } = req.body;

  if (!name || !email || !date || !time || !people || !prijs) {
    return res.status(400).json({ error: "Onvolledige gegevens" });
  }

  try {
    // 1️⃣ Opslaan in DB
    const [result] = await db.execute(
      "INSERT INTO bookings (name, email, date, time, people, prijs) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, date, time, people, prijs]
    );

    const bookingId = result.insertId;
    let mailError;

    // 2️⃣ Verstuur bevestigingsmail
    try {
      await transporter.sendMail({
        from: `"Bunker Museum" <${process.env.MAIL_USER}>`,
        to: email,
        subject: `Bevestiging boeking #${bookingId}`,
        text: `Beste ${name},\n\nBedankt voor je reservering op ${date} om ${time}.\nAantal personen: ${people}\nTotaalprijs: €${prijs}\n\nTot ziens bij Bunker Museum!`,
        html: `<p>Beste ${name},</p>
               <p>Bedankt voor je reservering op <strong>${date}</strong> om <strong>${time}</strong>.</p>
               <p>Aantal personen: ${people}<br/>Totaalprijs: €${prijs}</p>
               <p>Tot ziens bij Bunker Museum!</p>`
      });
    } catch (err) {
      console.error("❌ Fout bij verzenden mail:", err);
      mailError = err.message;
    }

    // 3️⃣ Stuur response terug
    res.json({ id: bookingId, mailError });

  } catch (err) {
    console.error("❌ Fout bij opslaan boeking:", err);
    res.status(500).json({ error: "Kon de boeking niet opslaan" });
  }
});

export default router;
