import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { login, signup } from "./auth.controller";

const router = Router();

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));

export const authRoutes = router;