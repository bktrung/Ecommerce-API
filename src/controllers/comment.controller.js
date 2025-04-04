import CommentService from "../services/comment.service.js";
import { CREATED, OK } from "../core/success.response.js";

class CommentController {
	createComment = async (req, res, next) => {
		CREATED.send({
			res,
			message: "Comment created successfully",
			metadata: await CommentService.createComment({
				...req.body,
				userId: req.user.userId
			}),
		});
	}

	getListComment = async (req, res, next) => {
		OK.send({
			res,
			message: "List comments fetched successfully",
			metadata: await CommentService.getListComment(req.query),
		});
	}

	deleteComment = async (req, res, next) => {
		OK.send({
			res,
			message: "Comment deleted successfully",
			metadata: await CommentService.deleteComment({
				commentId: req.params.id,
				userId: req.user.userId
			}),
		});
	}
}

export default new CommentController();