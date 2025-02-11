import { Router } from "express";
import { authentication } from "../../auth/authUtils.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";
import ProductController from "../../controllers/product.controller.js";

const router = Router();

router.get("/search/:keySearch", asyncHandler(ProductController.getListSearchProduct));
router.get("", asyncHandler(ProductController.findAllProducts));
router.get("/:id", asyncHandler(ProductController.findProduct));

// authentication middleware
router.use(authentication);

// routes
router.post("", asyncHandler(ProductController.createProduct));
router.patch("/:id", asyncHandler(ProductController.updateProduct));

router.post("/publish/:id", asyncHandler(ProductController.publishProduct));
router.post("/unpublish/:id", asyncHandler(ProductController.unpublishProduct));

router.get("/drafts/all", asyncHandler(ProductController.getAllDrafts));
router.get("/published/all", asyncHandler(ProductController.getAllPublished));

export default router;