import CommentController from "../../controllers/comment.controller.js";
import { Router } from "express";
import { asyncHandler } from "../../helpers/asyncHandler.js";
import { authentication } from "../../auth/authUtils.js";

const router = Router();

router.use(authentication);

router.post("", asyncHandler(CommentController.createComment));
router.get("", asyncHandler(CommentController.getListComment));
router.delete("/:id", asyncHandler(CommentController.deleteComment));

export default router;