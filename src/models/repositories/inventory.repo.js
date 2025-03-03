import inventory from "../inventory.model.js";

export const insertInventory = async (productId, shopId, stock, location) => {
	return await inventory.create({
		product: productId,
		shop: shopId,
		stock: stock,
		location: location,
	});
}

export const reservationInventory = async (productId, cartId, quantity) => {
	const query = {
		productId,
		stock: { $gte: quantity }
	}, update = {
		$inc: { stock: -quantity },
		$push: { 
			reservations: {
				quantity,
				cartId,
				createAt: new Date()
			}
		}
	}, options = {
		upsert: true,
		new: true
	};

	return await inventory.findOneAndUpdate(query, update, options).lean();
}