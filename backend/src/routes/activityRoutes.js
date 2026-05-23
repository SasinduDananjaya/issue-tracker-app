import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import activityController from "../controllers/activityController.js";

const router = Router();

router.use(auth);
router.get("/", activityController.list);

export default router;
