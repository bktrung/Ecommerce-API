import { Router } from "express";
import { authentication } from "../../auth/authUtils.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";
import ProductController from "../../controllers/product.controller.js";

const router = Router();

// authentication middleware
router.use(authentication);

// routes
router.post("", asyncHandler(ProductController.createProduct));

export default router;