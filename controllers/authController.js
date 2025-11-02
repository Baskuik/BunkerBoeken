import bcrypt from "bcrypt";
import { initDB } from "../db.js";

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "E-mail en wachtwoord zijn verplicht" });

  try {
    const db = await initDB();
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND role = 'admin'",
      [email]
    );

    if (!rows.length)
      return res.status(401).json({ message: "Ongeldige e-mail of wachtwoord" });

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Ongeldige e-mail of wachtwoord" });

    // ✅ Sla sessie op
    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;
    req.session.role = "admin";

    console.log("SESSION NA LOGIN:", req.session);

    res.status(200).json({
      message: "Succesvol ingelogd",
      admin: { id: admin.id, email: admin.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Serverfout bij inloggen" });
  }
};

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Kon sessie niet beëindigen" });
    res.clearCookie("admin_session");
    res.status(200).json({ message: "Succesvol uitgelogd" });
  });
};

export const me = (req, res) => {
  if (req.session && req.session.adminId) {
    res.json({
      adminId: req.session.adminId,
      adminEmail: req.session.adminEmail,
      role: req.session.role
    });
  } else {
    res.status(401).json({ message: "Niet ingelogd als admin" });
  }
};
