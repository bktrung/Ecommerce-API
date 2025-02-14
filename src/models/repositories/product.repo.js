import { Types } from "mongoose";
import { product } from "../product.model.js";

/**
 * @function searchProductByUser
 * @description Searches for published products using text search
 * @param {Object} params - Search parameters
 * @param {string} params.keySearch - Text to search for in products
 * @returns {Promise<Array>} Array of matching product documents
 */
export const searchProductByUser = async ({ keySearch }) => {
	return await product
		.find(
			{
				isPublished: true,
				$text: { $search: keySearch },
			},
			{ score: { $meta: "textScore" } }
		)
		.sort({ score: { $meta: "textScore" } })
		.lean();
};

/**
 * @function publishProductByShop 
 * @description Updates a draft product to published status
 * @param {Object} params - Product parameters
 * @param {string} params.product_shop - Shop ID that owns the product
 * @param {string} params.product_id - ID of product to publish
 * @returns {Promise<Object>} Updated product document
 */
export const publishProductByShop = async ({ product_shop, product_id }) => {
	return await product
		.findOneAndUpdate(
			{
				_id: new Types.ObjectId(product_id),
				shop: new Types.ObjectId(product_shop),
				isDraft: true,
			},
			{ $set: { isDraft: false, isPublished: true } },
			{ new: true }
		)
		.lean();
};

/**
 * @function unpublishProductByShop
 * @description Updates a published product back to draft status
 * @param {Object} params - Product parameters
 * @param {string} params.product_shop - Shop ID that owns the product
 * @param {string} params.product_id - ID of product to unpublish
 * @returns {Promise<Object>} Updated product document
 */
export const unpublishProductByShop = async ({ product_shop, product_id }) => {
	return await product
		.findOneAndUpdate(
			{
				_id: new Types.ObjectId(product_id),
				shop: new Types.ObjectId(product_shop),
				isPublished: true,
			},
			{ $set: { isDraft: true, isPublished: false } },
			{ new: true }
		)
		.lean();
};

/**
 * @function queryProduct
 * @description Queries products with pagination and population
 * @param {Object} params - Query parameters
 * @param {Object} params.query - MongoDB query object
 * @param {number} params.limit - Number of documents to return
 * @param {number} params.skip - Number of documents to skip
 * @returns {Promise<Array>} Array of product documents with populated shop info
 */
export const queryProduct = async ({ query, limit, skip }) => {
	return await product
		.find(query)
		.populate("shop", "name email -_id")
		.sort({ updatedAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean()
		.select("-__v");
};

export const findAllProducts = async ({ limit, sort, page, filter, select }) => {
	const skip = (page - 1) * limit;

	// _id is better than createdAt in single-criteria sorting in MongoDB
	const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };

	// Add total count for pagination
	const [products, totalCount] = await Promise.all([
		product
			.find(filter)
			.sort(sortBy)
			.limit(limit)
			.skip(skip)
			.select(select)
			.lean(),
		product.countDocuments(filter),
	]);

	return {
		pagination: {
			total: totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
		},
		products,
	};
};

export const findProduct = async ({ product_id, unselect }) => {
	return await product
		.findOne({
			_id: product_id,
			isPublished: true,
		})
		.select(unselect)
		.lean();
};

export const updateProductById = async ({ 
	product_id, bodyUpdate,
	model, isNew = true,
}) => {
	return await model.findByIdAndUpdate(
		product_id,
		{ $set: bodyUpdate },
		{ new: isNew }
	).lean();
};

export const checkProductsExist = async (productIds) => {
	const products = await product
		.find({
			_id: { $in: productIds },
			isPublished: true,
		})
		.select("_id")
		.lean();

	const foundIds = products.map((p) => p._id.toString());
	const notFoundIds = productIds.filter((id) => !foundIds.includes(id));

	return {
		isValid: notFoundIds.length === 0,
		notFoundIds,
	};
};
