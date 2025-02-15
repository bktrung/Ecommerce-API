import { CREATED, OK } from "../core/success.response.js";
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

	activateDiscount = async (req, res, next) => {
		OK.send({
			res,
			message: "Discount activated successfully",
			metadata: await DiscountService.activateDiscount({
				discountId: req.params.id,
				shop: req.user.userId,
			}),
		});
	}

	getAllDiscountsByShop = async (req, res, next) => {
		OK.send({
			res,
			message: "All discounts fetched successfully",
			metadata: await DiscountService.getAllDiscountsByShop({
				shopId: req.user.userId,
				limit: req.query.limit,
				page: req.query.page,
			}),
		});
	}

	getAllProductDiscounts = async (req, res, next) => {
		OK.send({
			res,
			message: "All product discounts fetched successfully",
			metadata: await DiscountService.getAllProductDiscounts({
				productId: req.params.productId,
				filter: req.query,
			}),
		});
	}

	getAllAppliedProducts = async (req, res, next) => {
		OK.send({
			res,
			message: "All applied products fetched successfully",
			metadata: await DiscountService.getAllAppliedProducts({
				code: req.query.code,
				shopId: req.query.shopId,
				limit: req.query.limit,
				page: req.query.page,
			}),
		});
	}

	getDiscountAmount = async (req, res, next) => {
		OK.send({
			res,
			message: "Discount amount fetched successfully",
			metadata: await DiscountService.getDiscountAmount({
				code: req.body.code,
				shopId: req.body.shopId,
				products: req.body.products
			}),
		});
	}
}

export default new DiscountController();