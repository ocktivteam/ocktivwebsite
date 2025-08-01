// middleware/checkAdmin.js
export function checkAdmin(req, res, next) {
    // Get user from JWT payload (assuming you verify the token earlier)
    const user = req.user; // You might set req.user in your JWT middleware
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  }
  