import checkoutController from "../../controllers/checkout.controller.js";
import { Router } from "express";
import { asyncHandler } from "../../helpers/asyncHandler.js";
import { authentication } from "../../auth/authUtils.js";

const router = Router();

router.use(authentication);

router.post("/review", asyncHandler(checkoutController.checkoutReview));

export default router;