import { CREATED, OK } from "../core/success.response.js";
import ProductService from "../services/product.service.js";

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
			),
		});
	};

	updateProduct = async (req, res, next) => {
		OK.send({
			res,
			message: "Product updated successfully",
			metadata: await ProductService.updateProduct(
				req.body.product_type,
				req.params.id,
				req.body,
			),
		});
	};

	publishProduct = async (req, res, next) => {
		OK.send({
			res,
			message: "Product published successfully",
			metadata: await ProductService.publishProductByShop({
				product_shop: req.user.userId,
				product_id: req.params.id,
			}),
		});
	};

	unpublishProduct = async (req, res, next) => {
		OK.send({
			res,
			message: "Product unpublished successfully",
			metadata: await ProductService.unpublishProductByShop({
				product_shop: req.user.userId,
				product_id: req.params.id,
			}),
		});
	};

	getAllDrafts = async (req, res, next) => {
		OK.send({
			res,
			message: "All drafts fetched successfully",
			metadata: await ProductService.findAllDraftsForShop({
				product_shop: req.user.userId,
			}),
		});
	};

	getAllPublished = async (req, res, next) => {
		OK.send({
			res,
			message: "All published fetched successfully",
			metadata: await ProductService.findAllPublishedForShop({
				product_shop: req.user.userId,
			}),
		});
	};

	getListSearchProduct = async (req, res, next) => {
		OK.send({
			res,
			message: "List of products fetched successfully",
			metadata: await ProductService.getListSearchProduct(req.params),
		});
	};

	findAllProducts = async (req, res, next) => {
		OK.send({
			res,
			message: "All products fetched successfully",
			metadata: await ProductService.findAllProducts(req.query),
		});
	}

	findProduct = async (req, res, next) => {
		OK.send({
			res,
			message: "Product fetched successfully",
			metadata: await ProductService.findProduct({ product_id: req.params.id }),
		});
	}
}

export default new ProductController();
