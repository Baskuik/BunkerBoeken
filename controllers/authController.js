// controllers/authController.js
import bcrypt from "bcryptjs";
import { db } from "../db.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Ongeldige e-mail of wachtwoord" });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Ongeldige e-mail of wachtwoord" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Geen toegang" });
    }

    // Sessie aanmaken
    req.session.adminId = user.id;
    req.session.adminEmail = user.email;

    res.json({ message: "Succesvol ingelogd" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Serverfout" });
  }
};

// ✅ Me route
export const me = (req, res) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ message: "Niet ingelogd" });
  }
  res.json({
    adminId: req.session.adminId,
    adminEmail: req.session.adminEmail,
    role: "admin",
  });
};

// ✅ Logout route
export const logout = (req, res) => {
  if (!req.session) return res.status(400).json({ message: "Geen actieve sessie" });

  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Kon niet uitloggen" });
    res.clearCookie("admin_session");
    res.json({ message: "Succesvol uitgelogd" });
  });
};
