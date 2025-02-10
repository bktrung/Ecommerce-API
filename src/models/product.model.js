import { model, Schema } from "mongoose";
import slugify from "slugify";

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
		product_slug: String,
		product_thumb: {
			type: String,
			required: true,
		},
		product_description: String,
		product_price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},
		product_quantity: {
			type: Number,
			required: [true, "Quantity is required"],
			min: [0, "Quantity cannot be negative"],
			default: 0,
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
		product_ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, "Rating must be above 1.0"],
			max: [5, "Rating must be below 5.0"],
			set: (value) => Math.round(value * 10) / 10,
		},
		product_variations: {
			type: Array,
			default: [],
		},
		isDraft: {
			type: Boolean,
			default: true,
			index: true,
			select: false,
		},
		isPublished: {
			type: Boolean,
			default: false,
			index: true,
			select: false,
		},
	},
	{
		timestamps: true,
		collection: COLLECTION_NAME,
	}
);

// create index for search
productSchema.index({ product_name: 'text', product_description: 'text' })

// Document middleware: runs before .save() and .create()
productSchema.pre('save', function(next) {
    this.product_slug = slugify(this.product_name, { lower: true })
    next()
})

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
