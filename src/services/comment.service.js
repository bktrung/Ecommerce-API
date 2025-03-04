import { createComment, getListComment } from "../models/repositories/comment.repo.js";

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
}

export default CommentService;