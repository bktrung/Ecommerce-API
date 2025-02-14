import { CREATED } from "../core/success.response.js";
import DiscountService from "../services/discount.service.js";

class DiscountController {
	createDiscount = async (req, res, next) => {
		CREATED.send({
			res,
			message: "Discount created successfully",
			metadata: await DiscountService.createDiscount({
				...req.body,
				shop: req.user.userId,
			}),
		});
	}
}

export default new DiscountController();