import { Router } from "express";
import cartController from "../../controllers/cart.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = Router();

router.get("", asyncHandler(cartController.getCart));
router.post("/items", asyncHandler(cartController.addToCart));
router.patch("/items", asyncHandler(cartController.updateItem));
router.delete("/items/:productId", asyncHandler(cartController.deleteItem));

export default router;