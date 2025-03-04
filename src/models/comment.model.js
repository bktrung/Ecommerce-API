import { model, Schema } from "mongoose";
import { type } from "os";

const DOCUMENT_NAME = "Comment";
const COLLECTION_NAME = "comments";

const commentSchema = new Schema({
	productId: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	left: {
		type: Number,
		default: 0,
	},
	right: {
		type: Number,
		default: 0,
	},
	parentId: {
		type: Schema.Types.ObjectId,
		ref: "Comment",
	},
	isDeleted: {
		type: Boolean,
		default: false,
	}
}, {
	timestamps: true,
	collection: COLLECTION_NAME,
});

export default model(DOCUMENT_NAME, commentSchema);