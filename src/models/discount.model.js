import { model, Schema } from "mongoose";

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

const discountSchema = new Schema({
	discount_name: {
		type: String,
		required: true,
	},
	discount_description: {
		type: String,
		required: true,
	},
	discount_type: {
		type: String,
		default: "fixed_amount", // or percentage
	},
	discount_value: { 
		type: Number,
		required: true,
	},
	discount_code: {
		type: String,
		required: true,
	},
	discount_startDate: {
		type: Date,
		required: true,
	},
	discount_endDate: {
		type: Date,
		required: true,
	},
	discount_maxUsage: {
		type: Number,
		default: 1,
	},
	discount_usageCount: {
		type: Number,
		required: true,
	},
	discount_usersUsed: {
		type: Array,
		default: [],
	},
	discount_maxUsagePerUser: {
		type: Number,
		required: true,
	},
	discount_minOrderValue: {
		type: Number,
		required: true,
	},
	discount_shop: {
		type: Schema.Types.ObjectId,
		ref: "Shop",
	},
	discount_isActive: {
		type: Boolean,
		default: true,
	},
	discount_appliesTo: {
		type: String,
		required: true,
		enum: ["all", "specific"],
	},
	discount_productIds: {
		type: Array,
		default: [],
	},
}, {
	timestamps: true,
	collection: COLLECTION_NAME,
});

export const Discount = model(DOCUMENT_NAME, discountSchema);