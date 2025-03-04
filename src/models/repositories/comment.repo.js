import { NotFoundError } from "../../core/error.response.js";
import comment from "../comment.model.js";

export const createComment = async ({
	productId, userId, content, parentId = null
}) => {
	const newComment = new comment({
		productId, userId, content, parentId
	});

	let rightValue;
	if (parentId) {
		// reply comment
		const parentComment = await comment.findById(parentId);
		if (!parentComment) {
			throw new NotFoundError("Parent comment not found");
		}

		rightValue = parentComment.right;
		await comment.bulkWrite([
			{
				updateMany: {
					filter: { productId, right: { $gte: rightValue } },
					update: { $inc: { right: 2 } }
				}
			},
			{
				updateMany: {
					filter: { productId, left: { $gt: rightValue } },
					update: { $inc: { left: 2 } }
				}
			}
		]);
	} else {
		const maxRightValue = await comment.findOne({ productId })
			.sort({ right: -1 })
			.select("right");

		if (maxRightValue) {
			rightValue = maxRightValue.right + 1;
		} else {
			rightValue = 1;
		}
	}

	// insert comment
	newComment.left = rightValue;
	newComment.right = rightValue + 1;

	return await newComment.save();
}

export const getListComment = async ({
	productId, parentId = null, limit = 50, page = 1
}) => {
	const skip = (page - 1) * limit;
	
	if (parentId) {
		const parentComment = await comment.findById(parentId);
		if (!parentComment) {
			throw new NotFoundError("Parent comment not found");
		}
		return await comment.find({
			productId,
			left: { $gt: parentComment.left },
			right: { $lt: parentComment.right },
		}).sort({ left: 1 }).skip(skip).limit(limit)
		.select("-__v -isDeleted -updatedAt");
	}

	return await comment.find({ productId, parentId: null })
		.sort({ left: 1 }).skip(skip).limit(limit)
		.select("-__v -isDeleted -updatedAt");
}