import { Router } from "express";
import AccessController from "../../controllers/access.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";
const router = Router();

router.post("/shop/signup", asyncHandler(AccessController.signUp));
router.post("/shop/refresh-token", asyncHandler(AccessController.refreshToken));
router.post("/shop/login", asyncHandler(AccessController.login));

export default router;
