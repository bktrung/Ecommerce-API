import CheckoutService from "../services/checkout.service.js";
import { OK, CREATED } from "../core/success.response.js";

class CheckoutController {
	checkoutReview = async (req, res, next) => {
		OK.send({
			res,
			message: "Checkout review successfully",
			metadata: await CheckoutService.checkoutReview({
				cartId: req.body.cartId,
				userId: req.query.userId,
				shopOrderIds: req.body.shopOrderIds,
			}),
		});
	}
}

export default new CheckoutController();