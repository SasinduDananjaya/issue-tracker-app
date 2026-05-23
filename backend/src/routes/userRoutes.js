import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import userController from "../controllers/userController.js";

const router = Router();

router.use(auth);
router.get("/", userController.listOrgMembers);

export default router;
