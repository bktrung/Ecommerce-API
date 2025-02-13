import inventory from "../inventory.model.js";

export const insertInventory = async (productId, shopId, stock, location) => {
	const newInventory = await inventory.create({
		inven_product: productId,
		inven_shop: shopId,
		inven_stock: stock,
		inven_location: location,
	});

	if (!newInventory) {
		throw new Error("Error: Failed to create inventory");
	}

	return newInventory;
}