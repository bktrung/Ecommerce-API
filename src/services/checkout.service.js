import { findCartById } from "../models/repositories/cart.repo.js";
import { BadRequestError } from "../core/error.response.js";
import { checkProductByServer } from "../models/repositories/product.repo.js";
import DiscountService from "./discount.service.js";
import order from "../models/order.model.js";
import { acquireLock, releaseLock } from "./redis.service.js";
import { rollbackInventory } from "../models/repositories/inventory.repo.js";

class CheckoutService {
	/*
	{ // login and without login
		cartId,
		userId,
		shopOrderIds: [
			{
				shopId,
				shopDiscounts: [
					{
						shopId,
						discountId,
						code,
					}
				],
				items: [
					{
						productId,
						price,
						quantity,
					}
				]
			}
		]
	}
	*/
	static async checkoutReview({
		cartId, userId, shopOrderIds
	}) {
		const foundCart = await findCartById({ cartId });
		if (!foundCart) {
			throw new BadRequestError('Cart not found');
		}

		const checkoutOrder = {
			totalPrice: 0,
			feeShip: 0,
			totalDiscount: 0,
			totalCheckout: 0,
		}, shopOrderIdsNew = [];

		for (let i = 0; i < shopOrderIds.length; i++) {
			const { shopId, shopDiscounts, items } = shopOrderIds[i];
			const checkProductServer = await checkProductByServer(items);
			console.log(checkProductServer);
			if (!checkProductServer[0]) {
				throw new BadRequestError('Order with invalid product');
			}

			// total order
			const checkoutPrice = checkProductServer.reduce((acc, product) => {
				return acc + (product.price * product.quantity);
			}, 0);

			// before discount
			checkoutOrder.totalPrice += checkoutPrice;

			const itemCheckout = {
				shopId,
				shopDiscounts,
				priceRaw: checkoutPrice,
				priceApplyDiscount: checkoutPrice,
				items: checkProductServer
			}

			// if shopDiscounts exist, check it
			if (shopDiscounts.length > 0) {
				// hypothesize only 1 discount for 1 shop
				const {totalPrice = 0, discount = 0} = await DiscountService.getDiscountAmount({
					code: shopDiscounts[0].code,
					shopId,
					products: checkProductServer
				})

				checkoutOrder.totalDiscount += discount;

				if (discount > 0) {
					itemCheckout.priceApplyDiscount = checkoutPrice - discount;
				}
			}

			checkoutOrder.totalCheckout += itemCheckout.priceApplyDiscount;
			shopOrderIdsNew.push(itemCheckout);
		}

		return {
			shopOrderIds: shopOrderIdsNew,
			checkoutOrder
		}
	}

	static async checkoutOrder({
		shopOrderIds, userId, cartId,
		userAddress = {}, userPayment = {}
	}) {
		const { shopOrderIdsNew, checkoutOrder } = await this.checkoutReview({
			cartId, userId, shopOrderIds
		});

		// check inventory
		const products = shopOrderIdsNew.flatMap((order) => order.items);
		const acquiredLocks = [];
		const reservedProducts = [];

		try {
			// Acquire locks and reserve inventory
			for (let i = 0; i < products.length; i++) {
				const { productId, quantity } = products[i];
				const keyLock = await acquireLock(productId, quantity, cartId);

				if (!keyLock) {
					// If any lock fails, rollback all previous reservations and release locks
					for (const { productId, quantity } of reservedProducts) {
						await rollbackInventory(productId, cartId, quantity);
					}
					for (const lock of acquiredLocks) {
						await releaseLock(lock);
					}
					throw new BadRequestError('Product out of stock in inventory');
				}

				acquiredLocks.push(keyLock);
				reservedProducts.push({ productId, quantity });
			}

			// Create order with reserved inventory
			const newOrder = await order.create({
				userId,
				checkout: checkoutOrder,
				shipping: userAddress,
				payment: userPayment,
				products: shopOrderIdsNew,
			});

			// If order creation successful, update cart
			if (newOrder) {
				// remove products from cart
				const foundCart = await findCartById({ cartId });
				if (!foundCart) {
					throw new BadRequestError('Cart not found');
				}
				const items = foundCart.items.filter((item) => {
					return !shopOrderIdsNew.some((order) => {
						return order.items.some((product) => {
							return product.productId.toString() === item.productId.toString();
						});
					});
				});

				await foundCart.updateOne({ items });
			}

			// Release all locks after successful order
			for (const lock of acquiredLocks) {
				await releaseLock(lock);
			}

			return newOrder;
		} catch (error) {
			// Rollback inventory reservations on any error
			for (const { productId, quantity } of reservedProducts) {
				await rollbackInventory(productId, cartId, quantity);
			}

			// Release all locks
			for (const lock of acquiredLocks) {
				await releaseLock(lock);
			}

			throw error;
		}
	}

	// get all orders by userId [user]
	static async getOrdersByUser({ userId }) {
		return await order.find({ userId }).lean();
	}

	// get one order by userId and orderId [user]
	static async getOneOrderByUser({ userId, orderId }) {}

	// cancel order [user]
	static async cancelOrderByUser({ userId, orderId }) {}

	// update order status [admin | shop]
	static async updateOrderStatusByShop({ orderId, status }) {}
}

export default CheckoutService;