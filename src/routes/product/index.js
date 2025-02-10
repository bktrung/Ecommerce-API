import { Router } from "express";
import { authentication } from "../../auth/authUtils.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";
import ProductController from "../../controllers/product.controller.js";

const router = Router();

router.get("/search/:keySearch", asyncHandler(ProductController.getListSearchProduct));

// authentication middleware
router.use(authentication);

// routes
router.post("", asyncHandler(ProductController.createProduct));
router.post("/publish/:id", asyncHandler(ProductController.publishProduct));
router.post("/unpublish/:id", asyncHandler(ProductController.unpublishProduct));

router.get("/drafts", asyncHandler(ProductController.getAllDrafts));
router.get("/published", asyncHandler(ProductController.getAllPublished));

export default router;