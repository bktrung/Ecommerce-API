import { Types } from "mongoose";
import { product } from "../product.model.js";
import { NotFoundError } from "../../core/error.response.js";

export const searchProductByUser = async ({ keySearch }) => {
	const results = await product
		.find(
			{
				isPublished: true,
				$text: { $search: keySearch },
			},
			{ score: { $meta: "textScore" } }
		)
		.sort({ score: { $meta: "textScore" } })
		.lean();
	return results;
};

export const publishProductByShop = async ({ product_shop, product_id }) => {
	const updatedProduct = await product
		.findOneAndUpdate(
			{
				_id: new Types.ObjectId(product_id),
				product_shop: new Types.ObjectId(product_shop),
				isDraft: true,
			},
			{ $set: { isDraft: false, isPublished: true } },
			{ new: true }
		)
		.lean();

	if (!updatedProduct) {
		throw new NotFoundError("Error: Product not found or already published");
	}

	return updatedProduct;
};

export const unpublishProductByShop = async ({ product_shop, product_id }) => {
	const updatedProduct = await product
		.findOneAndUpdate(
			{
				_id: new Types.ObjectId(product_id),
				product_shop: new Types.ObjectId(product_shop),
				isPublished: true,
			},
			{ $set: { isDraft: true, isPublished: false } },
			{ new: true }
		)
		.lean();

	if (!updatedProduct) {
		throw new NotFoundError("Error: Product not found or already unpublished");
	}

	return updatedProduct;
};

export const queryProduct = async ({ query, limit, skip }) => {
	return await product
		.find(query)
		.populate("product_shop", "name email -_id")
		.sort({ updatedAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean()
		.select("-__v");
};
