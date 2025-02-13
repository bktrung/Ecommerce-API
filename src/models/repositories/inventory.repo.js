import inventory from "../inventory.model.js";

export const insertInventory = async (productId, shopId, stock, location) => {
	const newInventory = await inventory.create({
		product: productId,
		shop: shopId,
		stock: stock,
		location: location,
	});

	if (!newInventory) {
		throw new Error("Error: Failed to create inventory");
	}

	return newInventory;
}