import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middlewares/auth";
import {
  createIssue,
  deleteIssue,
  getIssue,
  getIssues,
  updateIssue
} from "./issue.controller";

const router = Router();

router.post("/", requireAuth, asyncHandler(createIssue));
router.get("/", asyncHandler(getIssues));
router.get("/:id", asyncHandler(getIssue));
router.patch("/:id", requireAuth, asyncHandler(updateIssue));
router.delete("/:id", requireAuth, requireRole("maintainer"), asyncHandler(deleteIssue));

export const issueRoutes = router;