import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "Key";
const COLLECTION_NAME = "keys";

const keyTokenSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "Shop",
	},
	publicKey: {
		type: String,
		required: true,
	},
	refreshTokensUsed: {
		type: Array,
		default: [],
	},
	refreshToken: {
		type: String,
		required: true,
	},
	expiresAt: {
		type: Date,
		required: true,
	},
	isRevoked: {
		type: Boolean,
		default: false,
	},
}, {
	collection: COLLECTION_NAME,
	timestamps: true,
});

// Add deviceId if needed multiple devices login

// Add indices for faster queries
keyTokenSchema.index({ user: 1 });
keyTokenSchema.index({ refreshToken: 1 });
keyTokenSchema.index({ expiresAt: 1 });

export default model(DOCUMENT_NAME, keyTokenSchema);
