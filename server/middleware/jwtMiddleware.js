// middleware/jwtMiddleware.js
import jwt from "jsonwebtoken";

export function jwtMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token format error" });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId; // Set userId for easy access
    req.user = {
      _id: payload.userId,
      role: payload.role,
      username: payload.username,
      email: payload.email // if available in token
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}