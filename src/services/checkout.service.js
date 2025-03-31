import { findCartById } from "../models/repositories/cart.repo.js";
import { BadRequestError } from "../core/error.response.js";
import { checkProductByServer } from "../models/repositories/product.repo.js";
import DiscountService from "./discount.service.js";
import order from "../models/order.model.js";

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
		userAddress, userPhone, userPayment
	}) {
		const { shopOrderIdsNew, checkoutOrder } = await this.checkoutReview({
			cartId, userId, shopOrderIds
		});

		// check inventory
		const products = shopOrderIdsNew.flatMap((order) => order.items);
		const locks = [];
		const acquiredProducts = []
		for (let i = 0; i < products.length; i++) {
			const product = products[i];
			const lockResource = `product_lock:${product.productId}`;
			try {
				// Acquire lock for 3 seconds
				const lock = await redlock.acquire([lockResource], 3000);
				locks.push(lock);

				// Try to reserve inventory
				const reservation = await reservationInventory(
					product.productId,
					cartId,
					product.quantity
				);

				acquiredProducts.push(!!reservation);
			} catch (error) {
				// Failed to acquire lock or reserve inventory
				acquiredProducts.push(false);
				// Continue the loop to collect all results
			}
		}

		try {
			// Check if all products were acquired successfully
			if (acquiredProducts.includes(false)) {
				throw new BadRequestError('One or more products are out of stock');
			}

			// Create the order
			const newOrder = await order.create({
				userId,
				checkout: checkoutOrder,
				shipping: userAddress,
				payment: userPayment,
				products: shopOrderIdsNew
			});

			// TODO: Remove items from cart after successful order
			// if (newOrder) {
			//   await CartService.removeCartItems({ userId, cartId, items: products.map(p => p.productId) });
			// }

			return newOrder;
		} finally {
			// Release all locks regardless of success or failure
			await Promise.all(locks.map(lock => lock.release()));
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