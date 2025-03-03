import { Schema, model } from 'mongoose';

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'orders';

const orderSchema = new Schema({
	// update later when implement user
	user: {
		type: Number,
		required: true
	},
	// end update later
	/*
	{
		checkout: {
			totalPrice,
			totalApplyDiscount,
			feeShip,
			etc...
		},
	} 
	*/
	checkout: {
		type: Object,
		default: {},
	},
	/*
	{
		shipping: {
			street,
			city,
			state,
			country,
			zip,
			phone,
			etc...
		},
	}
	*/
	shipping: {
		type: Object,
		default: {},
	},
	payment: {
		type: Object,
		default: {},
	},
	products: {
		type: Array,
		default: [],
		required: true
	},
	trackingNumber: {
		type: String,
		default: '#00000102032025'
	},
	status: {
		type: String,
		enum: ['pending', 'confirmed', 'shipped', 'cancelled'],
		default: 'pending'
	}
}, {
	timestamps: true,
	collection: COLLECTION_NAME,
});

export default model(DOCUMENT_NAME, orderSchema);