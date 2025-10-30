// middleware/adminMiddleware.js
export function isAdminLoggedIn(req, res, next) {
  if (req.session && req.session.adminId) {
    next();
  } else {
    res.status(401).json({ message: "Niet ingelogd als admin" });
  }
}
