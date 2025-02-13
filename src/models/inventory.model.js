import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "inventories";

const inventorySchema = new Schema({
	product: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	location: {
		type: String,
		default: "unknown",
	},
	stock: {
		type: Number,
		required: true,
	},
	shop: {
		type: Schema.Types.ObjectId,
		ref: "Shop",
		required: true,
	},
	reservations: {
		type: Array,
		default: [],
	},
}, {
	timestamps: true,
	collection: COLLECTION_NAME,
});

export default model(DOCUMENT_NAME, inventorySchema);
