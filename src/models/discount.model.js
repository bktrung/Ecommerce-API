import { model, Schema } from "mongoose";

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

const discountSchema = new Schema({
	discount_name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		default: "fixed_amount", // or percentage
	},
	value: { 
		type: Number,
		required: true,
	},
	code: {
		type: String,
		required: true,
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
		required: true,
	},
	maxUsage: { // max usage of the discount code
		type: Number,
		default: 1,
	},
	usageCount: { // how many times the discount code has been used
		type: Number,
		required: true,
	},
	usersUsed: { // users who have used the discount code
		type: Array,
		default: [],
	},
	maxUsagePerUser: { // max usage of the discount code per user
		type: Number,
		required: true,
	},
	minOrderValue: { // minimum order value to use the discount code
		type: Number,
		required: true,
	},
	shopId: {
		type: Schema.Types.ObjectId,
		ref: "Shop",
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	appliesTo: {
		type: String,
		required: true,
		enum: ["all", "specific"],
	},
	productIds: { // products the discount code applies to
		type: Array,
		default: [],
	},
}, {
	timestamps: true,
	collection: COLLECTION_NAME,
});

export const Discount = model(DOCUMENT_NAME, discountSchema);