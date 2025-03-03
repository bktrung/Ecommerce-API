import inventory from "../models/inventory.model.js";
import { findProduct } from "../models/repositories/product.repo";
import { NotFoundError } from "../core/error.response";

class InventoryService {
	static async addStockToInventory({
		stock, productId, shopId, location
	}) {
		const product = await findProduct({ product_id: productId });
		if (!product) {
			throw new NotFoundError('Product not found');
		}

		const query = {
			shopId,
			productId
		}, update = {
			$inc: { stock },
			$set: { location }
		}, options = {
			upsert: true,
			new: true
		};

		return await inventory.findOneAndUpdate(query, update, options).lean();
	}
}

export default InventoryService;