import jwt from "jsonwebtoken";

export function jwtMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: payload.userId,
      role: payload.role,
      username: payload.username
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
