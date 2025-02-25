import CartService from "../services/cart.service.js";
import { OK, CREATED } from "../core/success.response.js";

class CartController {
	addToCart = async (req, res, next) => {
		CREATED.send({
			res,
			message: "Product added to cart successfully",
			metadata: await CartService.addToCart({
				userId: req.query.userId,
				item: req.body
			})
		});
	}

	// update quantity of item in cart
	updateItem = async (req, res, next) => {
		OK.send({
			res,
			message: "Cart updated successfully",
			metadata: await CartService.updateItemQuantity({
				userId: req.query.userId,
				shopOrderIds: req.body.shopOrderIds
			})
		});
	}

	deleteItem = async (req, res, next) => {
		OK.send({
			res,
			message: "Product removed from cart successfully",
			metadata: await CartService.removeItemFromCart({
				userId: req.query.userId,
				productId: req.params.productId
			})
		})
	}

	getCart = async (req, res, next) => {
		OK.send({
			res,
			message: "Cart fetched successfully",
			metadata: await CartService.getUserCart(req.query)
		})
	}
}

export default new CartController();