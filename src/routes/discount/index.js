import { Router } from "express";
import discountController from "../../controllers/discount.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";
import { authentication } from "../../auth/authUtils.js";
const router = Router();

// Authentication
router.use(authentication);

router.post("", asyncHandler(discountController.createDiscount));

export default router;