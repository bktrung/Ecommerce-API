import { Schema, model } from 'mongoose';

const cartItemSchema = new Schema({
	productId: {
		type: Schema.Types.ObjectId,
    	required: true
	},
	shopId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	quantity: {
		type: Number,
		required: true,
		min: 1
	},
	// price_at_add: Number,
	// name: String,
	// thumb: String, 
	// etc... 
	// common practice in production, but i will remove this for simplicity
	// also when i implement SKU in future, i will comback and update this
}, { _id: false });

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'carts';

const CART_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    FAILED: 'failed',
    PENDING: 'pending',
};

const cartSchema = new Schema({
    status: {
        type: String,
        enum: Object.values(CART_STATUS),
        default: CART_STATUS.ACTIVE,
		required: true
    },
	items: {
		type: [cartItemSchema],
		default: [],
		required: true
	},
	countItems: {
		type: Number,
		default: 0
	},
	// update later when implement user
	userId: {
		type: String,
		required: true
	}
	// end update later
}, {
	timestamps: true,
	collection: COLLECTION_NAME,
});

export default model(DOCUMENT_NAME, cartSchema);