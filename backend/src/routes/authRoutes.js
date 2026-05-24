import { Router } from "express";
import authController from "../controllers/authController.js";
import auth from "../middleware/authMiddleware.js";
import { validate, RegisterDTO, LoginDTO } from "../DTOs/authDTO.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

//auth routes for registration, login, token refresh, logout and getting current user info
router.post("/register", authLimiter, validate(RegisterDTO), authController.register);
router.post("/login", authLimiter, validate(LoginDTO), authController.login);

// refresh and logout read the refresh token from the httpOnly cookie
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", authLimiter, authController.logout);

router.get("/me", auth, authController.getMyInfo);

export default router;
