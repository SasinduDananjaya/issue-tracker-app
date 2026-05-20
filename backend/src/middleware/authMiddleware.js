import jwt from "jsonwebtoken";
import AppError from "../utils/error.js";

//middleware to protect routes and ensure the user is authenticated
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Access token required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    next(new AppError("Invalid or expired access token", 401));
  }
};

export default auth;
