import inventory from "../inventory.model.js";

export const insertInventory = async (productId, shopId, stock, location) => {
	return await inventory.create({
		product: productId,
		shop: shopId,
		stock: stock,
		location: location,
	});
}