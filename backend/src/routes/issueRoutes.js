import { Router } from "express";
import issueController from "../controllers/issueController.js";
import auth from "../middleware/authMiddleware.js";
import { validate } from "../DTOs/authDTO.js";
import { CreateIssueDTO, UpdateIssueDTO, ListIssuesDTO } from "../DTOs/issueDTO.js";

const router = Router();

//make all issue routes require authentication
router.use(auth);

router.post("/", validate(CreateIssueDTO), issueController.create);
router.get("/", validate(ListIssuesDTO, "query"), issueController.list);
router.get("/stats", issueController.stats);

router.get("/:uuid", issueController.getOne);
router.put("/:uuid", validate(UpdateIssueDTO), issueController.update);

router.delete("/:uuid", issueController.remove);
router.get("/:uuid/audit", issueController.auditLog);

export default router;
