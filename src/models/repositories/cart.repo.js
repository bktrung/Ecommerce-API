import cart from '../cart.model.js';

export const createUserCart = async ({ userId, item }) => {
	const query = {
		userId,
		status: 'active',
	};
	const updateOrInsert = {
		$push: {
			items: item,
		},
		$inc: {
			countItems: 1,
		},
	};
	const options = {
		upsert: true,
		new: true,
	};

	return await cart.findOneAndUpdate(query, updateOrInsert, options).lean();
}

export const findUserCart = async ({ userId }) => {
	return await cart.findOne({ userId, status: 'active' }).lean();
}

export const updateItemQuantity = async ({ userId, item }) => {
	const { productId, quantity } = item;
	const query = {
		userId,
		'items.productId': productId,
		status: 'active'
	};
	const update = {
		$inc: {
			'items.$.quantity': quantity
		}
	};
	const options = {
		new: true
	}
	return await cart.findOneAndUpdate(query, update, options).lean();
}

export const addItemToCart = async ({ userId, item }) => {
	const query = {
		userId,
		status: 'active',
		'items.productId': { $ne: item.productId }
	};
	const update = {
		$push: {
			items: item
		},
		$inc: {
			countItems: 1
		}
	};
	const options = {
		new: true
	};
	return await cart.findOneAndUpdate(query, update, options).lean();
}

// change to delete item from cart
export const removeItemFromCart = async ({ userId, productId }) => {
	const query = {
		userId,
		status: 'active'
	};
	const update = {
		$pull: {
			items: { productId } // could have type, etc...
		},
		$inc: {
			countItems: -1
		}
	};
	const options = {
		new: true
	};
	return await cart.findOneAndUpdate(query, update, options).lean();
}

export const findCartByUserId = async ({ userId }) => {
	return await cart.findOne({ userId }).lean();
}