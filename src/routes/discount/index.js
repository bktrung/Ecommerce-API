import { Router } from "express";
import discountController from "../../controllers/discount.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";
import { authentication } from "../../auth/authUtils.js";
const router = Router();

router.get("/product/:productId", asyncHandler(discountController.getAllProductDiscounts));
router.get("/products", asyncHandler(discountController.getAllAppliedProducts));
router.get("/amount", asyncHandler(discountController.getDiscountAmount));

// Authentication
router.use(authentication);

router.post("", asyncHandler(discountController.createDiscount));
router.get("", asyncHandler(discountController.getAllDiscountsByShop));
router.post("/activate/:id", asyncHandler(discountController.activateDiscount));

export default router;