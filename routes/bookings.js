import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const { name, email, date, time, people } = req.body;

    // Simuleer dat een boeking een ID krijgt van de "database"
    const bookingId = Math.floor(Math.random() * 10000);
    const createdAt = new Date().toISOString();

    // ✉️ Mailtemplate
    const mailHtml = `
      <h2>Bevestiging boeking</h2>
      <p><b>Bevestigingsnummer:</b> ${bookingId}</p>
      <p><b>Naam:</b> ${name}</p>
      <p><b>E-mail:</b> ${email}</p>
      <p><b>Datum:</b> ${date}</p>
      <p><b>Tijd:</b> ${time}</p>
      <p><b>Aantal personen:</b> ${people}</p>
      <p><b>Gemaakt op:</b> ${createdAt}</p>

      <h3>Locatie</h3>
      <p>
        Bunker Museum (voorbeeldadres):<br />
        Hoofdstraat 1, 1234 AB, Plaatsnaam
      </p>
      <p><i>Let op: dit is een tijdelijke placeholder.</i></p>
    `;

    // ✉️ Configureer de mailer (voorbeeld met Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER, // bv. bunker@gmail.com
        pass: process.env.MAIL_PASS, // app-specifiek wachtwoord
      },
    });

    await transporter.sendMail({
      from: `"Bunker Museum" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Bevestiging boeking #${bookingId}`,
      html: mailHtml,
    });

    // ✅ Verstuur response terug naar frontend
    res.json({
      id: bookingId,
      name,
      email,
      date,
      time,
      people,
      created_at: createdAt,
      message: "Boeking succesvol en e-mail verzonden",
    });

  } catch (err) {
    console.error("Fout bij versturen mail:", err);
    res.status(500).json({ error: "Fout bij versturen bevestiging" });
  }
});

export default router;
