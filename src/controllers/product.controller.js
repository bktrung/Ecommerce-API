import { CREATED } from "../core/success.response.js"
import ProductService from "../services/product.service.js"

class ProductController {
	createProduct = async (req, res, next) => {
		CREATED.send({
			res,
			message: "Product created successfully",
			metadata: await ProductService.createProduct(
				req.body.product_type,
				{
					...req.body,
					product_shop: req.user.userId,
				}
			)
		})
	}
}

export default new ProductController()