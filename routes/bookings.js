// routes/bookingRoutes.js
import express from "express";
import nodemailer from "nodemailer";
import { db } from "../index.js"; // database connectie

const router = express.Router();

// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const { name, email, date, time, people } = req.body;

    if (!name || !email || !date || !time || !people) {
      return res.status(400).json({ error: "Alle velden zijn verplicht" });
    }

    // Bereken prijs
    const prijs = Number(people) * 10;

    // Opslaan in database
    const [result] = await db.execute(
      "INSERT INTO bookings (name, email, date, time, people, prijs) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, date, time, people, prijs]
    );

    const bookingId = result.insertId;
    const createdAt = new Date().toISOString();

    // Mail HTML
    const mailHtml = `
      <h2>Bevestiging boeking</h2>
      <p><b>Bevestigingsnummer:</b> ${bookingId}</p>
      <p><b>Naam:</b> ${name}</p>
      <p><b>E-mail:</b> ${email}</p>
      <p><b>Datum:</b> ${date}</p>
      <p><b>Tijd:</b> ${time}</p>
      <p><b>Aantal personen:</b> ${people}</p>
      <p><b>Prijs:</b> €${prijs}</p>
      <p><b>Gemaakt op:</b> ${createdAt}</p>
      <h3>Locatie</h3>
      <p>
        Bunker Museum (voorbeeldadres):<br />
        Hoofdstraat 1, 1234 AB, Plaatsnaam
      </p>
      <p><i>Let op: dit is een tijdelijke placeholder.</i></p>
    `;

    // Mail versturen
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Bunker Museum" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Bevestiging boeking #${bookingId}`,
      html: mailHtml,
    });

    // Response naar frontend
    res.json({
      id: bookingId,
      name,
      email,
      date,
      time,
      people,
      prijs,
      created_at: createdAt,
      message: "Boeking succesvol en e-mail verzonden",
    });

  } catch (err) {
    console.error("Fout bij boeking:", err);
    res.status(500).json({ error: "Fout bij verwerken boeking" });
  }
});

export default router;
