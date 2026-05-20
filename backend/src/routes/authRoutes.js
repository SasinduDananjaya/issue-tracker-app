import { Router } from "express";
import authController from "../controllers/authController.js";
import auth from "../middleware/authMiddleware.js";
import { validate, RegisterDTO, LoginDTO, RefreshDTO } from "../DTOs/authDTO.js";

const router = Router();

//auth routes for registration, login, token refresh, logout and getting current user info
router.post("/register", validate(RegisterDTO), authController.register);
router.post("/login", validate(LoginDTO), authController.login);

router.post("/refresh", validate(RefreshDTO), authController.refresh);
router.post("/logout", validate(RefreshDTO), authController.logout);

router.get("/me", auth, authController.getMyInfo);

export default router;
