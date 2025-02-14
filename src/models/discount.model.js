import { model, Schema } from "mongoose";

// Discount Usage Schema
const USAGE_DOCUMENT_NAME = "DiscountUsage";
const USAGE_COLLECTION_NAME = "discount_usages";

const discountUsageSchema = new Schema({
	discountId: {
		type: String,
		required: true,
		index: true,
	},
	userId: {
		type: String,
		required: true,
		index: true,
	},
	usedAt: {
		type: Date,
		default: Date.now,
	},
}, {
	timestamps: true,
	collection: USAGE_COLLECTION_NAME,
});

// Compound index for faster queries
discountUsageSchema.index({ discountId: 1, userId: 1 });

// Discount Schema
const DISCOUNT_DOCUMENT_NAME = "Discount";
const DISCOUNT_COLLECTION_NAME = "discounts";

export const DISCOUNT_TYPES = {
	FIXED_AMOUNT: "fixed_amount",
	PERCENTAGE: "percentage",
};

export const APPLY_TYPES = {
	ALL: "all",
	SPECIFIC: "specific",
};

const discountSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	description: String,
	type: {
		type: String,
		default: DISCOUNT_TYPES.FIXED_AMOUNT,
		enum: Object.values(DISCOUNT_TYPES),
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
	maxUsage: {
		// max usage of the discount code
		type: Number,
		required: true,
	},
	usersUsing: {
		// users who holding the discount in payment process but not finish yet
		type: [String],
		default: [],
		select: false,
	},
	usageCount: {
		// how many times the discount code has been used
		type: Number,
		default: 0,
	},
	maxUsagePerUser: {
		// how many times a user can use the discount code
		type: Number,
		required: true,
	},
	minOrderValue: {
		// minimum order value to use the discount code
		type: Number,
		required: true,
	},
	maxValue: {
		// if type is percentage, then this is the maximum it can discount
		type: Number,
		required: true,
	},
	shop: {
		type: Schema.Types.ObjectId,
		ref: "Shop",
	},
	isActive: {
		type: Boolean,
		default: false,
	},
	appliesTo: {
		type: String,
		required: true,
		enum: Object.values(APPLY_TYPES),
	},
	productIds: {
		type: [String],
		default: [],
	},
}, {
	timestamps: true,
	collection: DISCOUNT_COLLECTION_NAME,
});

// Export both models
export const discount = model(DISCOUNT_DOCUMENT_NAME, discountSchema);
export const discountUsage = model(USAGE_DOCUMENT_NAME, discountUsageSchema);