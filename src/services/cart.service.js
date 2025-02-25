import { 
	findCartByUserId, 
	findUserCart, 
	createUserCart, 
	removeItemFromCart, 
	updateItemQuantity,
	addItemToCart,
} from '../models/repositories/cart.repo.js';
import { findProduct } from '../models/repositories/product.repo.js';
import { NotFoundError } from '../core/error.response.js';

class CartService {
    static async addToCart({ userId, item }) {
		const product = await findProduct({ product_id: item.productId });
		if (!product) {
			throw new NotFoundError('Product not found');
		}
		if (product.shop.toString() !== item.shopId) {
			throw new NotFoundError('Product not found');
		}

		// add full validate later

        const userCart = await findUserCart({ userId });
        if (!userCart) {
            return await createUserCart({ userId, item });
        }

		const existingItem = userCart.items.find(
			p => p.productId.toString() === item.productId.toString()
		);

        if (existingItem) {
			// Update quantity if item exists
			return await updateItemQuantity({ userId, item });
		} else {
			// Add new item to cart
			return await addItemToCart({ userId, item });
		}
    }

	/* update cart item quantity
		shopOrderIds: [
			{
				shopId,
				itemProducts: [
					{
						productId,
						shopId,
						oldQuantity,
						quantity
					}
				],
				version
			}
		]
	*/
	static async updateItemQuantity({ userId, shopOrderIds }) {
		// temporary only update first item
		const { productId, quantity, oldQuantity } = shopOrderIds[0]?.itemProducts[0];
		const foundProduct = await findProduct({ product_id: productId });

		if (!foundProduct) {
			throw new NotFoundError('Product not found');
		}

		if (foundProduct.shop.toString() !== shopOrderIds[0]?.shopId) {
			throw new NotFoundError('Product not found');
		}

		if (quantity <= 0) {
			return await removeItemFromCart({ userId, productId });
		}

		// add check inventory, etc later
		// add check old quantity later

		return await updateItemQuantity({
			userId,
			item: {
				productId,
				quantity: quantity - oldQuantity,
			}
		})
	}

	static async removeItemFromCart({ userId, productId }) {
		return await removeItemFromCart({ userId, productId });
	}

	static async getUserCart({ userId }) {
		// add checking for user cart later
		return await findCartByUserId({ userId });
	}
}

export default CartService;