// routes/adminRoutes.js
import express from "express";
import { isAdminLoggedIn } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Dashboard route (alleen toegankelijk voor ingelogde admins)
router.get("/dashboard", isAdminLoggedIn, (req, res) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ message: "Niet ingelogd als admin" });
  }

  res.json({
    message: `Welkom bij het admin dashboard, ${req.session.adminEmail}`,
    adminId: req.session.adminId,
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

export default router;
