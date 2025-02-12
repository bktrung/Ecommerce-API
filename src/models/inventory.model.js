import { Schema, model } from "mongoose";
import { type } from "os";

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "inventories";

const inventorySchema = new Schema({
	inven_productId: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	inven_location: {
		type: String,
		default: "unknown",
	},
	inven_stock: {
		type: Number,
		required: true,
	},
	inven_shopId: {
		type: Schema.Types.ObjectId,
		ref: "Shop",
		required: true,
	},
	inven_reservations: {
		type: Array,
		default: [],
	}
}, {
		timestamps: true,
		collection: COLLECTION_NAME,
});

export default model(DOCUMENT_NAME, inventorySchema);