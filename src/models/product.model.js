import { model, Schema } from "mongoose";

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "products";

const PRODUCT_TYPES = {
	ELECTRONIC: "Electronic",
	CLOTHING: "Clothing",
	FURNITURE: "Furniture",
};

const productSchema = new Schema(
	{
		product_name: {
			type: String,
			required: true,
		},
		product_thumb: {
			type: String,
			required: true,
		},
		product_description: String,
		product_price: {
			type: Number,
			required: true,
		},
		product_quantity: {
			type: Number,
			required: true,
		},
		product_type: {
			type: String,
			required: true,
			enum: Object.values(PRODUCT_TYPES),
		},
		product_shop: {
			type: Schema.Types.ObjectId,
			ref: "Shop",
		},
		product_attributes: {
			type: Schema.Types.Mixed,
			required: true,
		},
	},
	{
		timestamps: true,
		collection: COLLECTION_NAME,
	}
);

// define the product type = clothing
const clothingSchema = new Schema(
	{
		brand: {
			type: String,
			required: true,
		},
		size: String,
		material: String,
		product_shop: {
			type: Schema.Types.ObjectId,
			ref: "Shop",
		},
	},
	{
		timestamps: true,
		collection: "clothes",
	}
);

// define the product type = electronic
const electronicSchema = new Schema(
	{
		manufacturer: {
			type: String,
			required: true,
		},
		model: String,
		color: String,
		product_shop: {
			type: Schema.Types.ObjectId,
			ref: "Shop",
		},
	},
	{
		timestamps: true,
		collection: "electronics",
	}
);

// define the product type = furniture
const furnitureSchema = new Schema(
	{
		material: {
			type: String,
			required: true,
		},
		color: String,
		weight: Number,
		product_shop: {
			type: Schema.Types.ObjectId,
			ref: "Shop",
		},
	},
	{
		timestamps: true,
		collection: "furnitures",
	}
);

export const product = model(DOCUMENT_NAME, productSchema);
export const clothing = model(PRODUCT_TYPES.CLOTHING, clothingSchema);
export const electronic = model(PRODUCT_TYPES.ELECTRONIC, electronicSchema);
export const furniture = model(PRODUCT_TYPES.FURNITURE, furnitureSchema);
