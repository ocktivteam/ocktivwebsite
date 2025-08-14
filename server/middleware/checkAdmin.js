// middleware/checkAdmin.js
export function checkAdmin(req, res, next) {
    // Get user from JWT payload (assuming you verify the token earlier)
    const user = req.user; // You might set req.user in your JWT middleware
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  }
  

// Reusable role gate: pass allowed roles, e.g. ["instructor","admin"]
export function requireRole(roles = []) {
  return (req, res, next) => {
    const user = req.user;
    const role = String(user?.role || "").toLowerCase();
    const allowed = roles.map(r => r.toLowerCase());
    if (!user || !allowed.includes(role)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  };
}