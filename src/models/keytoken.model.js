import mongoose from 'mongoose'; 

const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'keys';

const keyTokenSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Shop'
	},
	publicKey: {
		type: String,
		required: true,
	},
	refreshTokensUsed: {
		type: Array,
		default: []
	},
	refreshToken: {
		type: String,
		required: true
	},
	expiresAt: {
		type: Date,
		required: true
	},
	isRevoked: {
		type: Boolean,
		default: false
	}
}, {
	collection: COLLECTION_NAME,
	timestamps: true
});

// Add indices for faster queries
keyTokenSchema.index({ user: 1 });
keyTokenSchema.index({ refreshToken: 1 });
keyTokenSchema.index({ expiresAt: 1 });

export default mongoose.model(DOCUMENT_NAME, keyTokenSchema);
