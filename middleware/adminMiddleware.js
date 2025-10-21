// middleware/adminMiddleware.js
export const isAdminLoggedIn = (req, res, next) => {
  if (req.session && req.session.adminId) {
    // Admin is ingelogd
    return next();
  } else {
    return res.status(401).json({ message: "Niet ingelogd als admin" });
  }
};
