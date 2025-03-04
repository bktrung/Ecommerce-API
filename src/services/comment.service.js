import { createComment, deleteComment, findCommentById, getListComment } from "../models/repositories/comment.repo.js";
import { ForbiddenError, NotFoundError } from "../core/error.response.js";

/*
	addComment [User | Shop]
	getListComment [User | Shop]
	deleteComment [User | Shop | Admin]
*/

class CommentService {
	static async createComment({
		productId, userId, content, parentId = null
	}) {
		return await createComment({
			productId, userId, content, parentId
		});
	}

	static async getListComment({
		productId, parentId = null, limit = 50, page = 1
	}) {
		return await getListComment({
			productId, parentId, limit, page
		});
	}

	static async deleteComment({ commentId, userId }) {
		const foundComment = await findCommentById(commentId);
		if (!foundComment) {
			throw new NotFoundError("Comment not found");
		}

		// check permission [User | Shop | Admin]
		if (foundComment.userId.toString() !== userId) {
			throw new ForbiddenError("Permission denied");
		}

		return await deleteComment(foundComment);
	}
}

export default CommentService;