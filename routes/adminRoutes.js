// routes/adminRoutes.js
import express from "express";
import { isAdminLoggedIn } from "../middleware/adminMiddleware.js";
import { db } from "../index.js";


const router = express.Router();

// Me route → wordt gebruikt door frontend om te checken of admin ingelogd is
router.get("/me", isAdminLoggedIn, (req, res) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ message: "Niet ingelogd als admin" });
  }

  res.json({
    adminId: req.session.adminId,
    adminEmail: req.session.adminEmail,
    role: "admin",
  });
});

// Logout route
router.post("/logout", isAdminLoggedIn, (req, res) => {
  if (!req.session) {
    return res.status(400).json({ message: "Geen actieve sessie" });
  }

  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: "Kon niet uitloggen" });
    }
    res.clearCookie("admin_session"); // verwijder cookie veilig
    res.json({ message: "Succesvol uitgelogd" });
  });
});

// Alle boekingen ophalen
router.get("/bookings", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bookings ORDER BY date DESC, time ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon boekingen niet ophalen" });
  }
});

// Boekingen bijwerken
router.put("/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, date, time, people, prijs } = req.body;
  try {
    await db.execute(
      "UPDATE bookings SET name=?, email=?, date=?, time=?, people=?, prijs=? WHERE id=?",
      [name, email, date, time, people, prijs, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon boeking niet bijwerken" });
  }
});

// Boekingen verwijderen
router.delete("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM bookings WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon boeking niet verwijderen" });
  }
});

export default router;


