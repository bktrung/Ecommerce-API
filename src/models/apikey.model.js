import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "KeyToken";
const COLLECTION_NAME = "keytokens";

const apiKeySchema = new Schema({
	key: {
		type: String,
		required: true,
		unique: true,
	},
	status: {
		type: Boolean,
		default: true,
	},
	permissions: {
		type: [String],
		enum: ["0000", "1111", "2222"],
		required: true,
	},
}, {
	timestamps: true,
	collection: COLLECTION_NAME,
});

export default model(DOCUMENT_NAME, apiKeySchema);