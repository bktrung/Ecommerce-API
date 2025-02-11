import { BadRequestError } from "../core/error.response.js";
import {
	product,
	clothing,
	electronic,
	furniture,
} from "../models/product.model.js";
import {
	publishProductByShop,
	unpublishProductByShop,
	queryProduct,
	searchProductByUser,
	findAllProducts,
	findProduct,
	updateProductById,
} from "../models/repositories/product.repo.js";
import {
	removeUndefinedObject,
	updateNestedObjectParser,
} from "../utils/index.js";

const PRODUCT_TYPE_MODELS = {
	"Clothing": clothing,
	"Electronic": electronic,
	"Furniture": furniture,
};

class ProductFactory {
	static productRegistry = {};

	static registerProductType(type, productClass) {
		ProductFactory.productRegistry[type] = productClass;
	}

	static async createProduct(type, payload) {
		const productClass = ProductFactory.productRegistry[type];
		if (!productClass) {
			throw BadRequestError("Error: Invalid product type");
		}
		return new productClass(payload).createProduct();
	}

	static async updateProduct(type, product_id, payload) {
		const productClass = ProductFactory.productRegistry[type];
		if (!productClass) {
			throw new BadRequestError("Error: Invalid product type");
		}
		return new productClass(payload).updateProduct(product_id);
	}

	static async publishProductByShop({ product_shop, product_id }) {
		return await publishProductByShop({ product_shop, product_id });
	}

	static async unpublishProductByShop({ product_shop, product_id }) {
		return await unpublishProductByShop({ product_shop, product_id });
	}

	static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
		const query = { product_shop, isDraft: true };
		return await queryProduct({ query, limit, skip });
	}

	static async findAllPublishedForShop({
		product_shop,
		limit = 50,
		skip = 0,
	}) {
		const query = { product_shop, isPublished: true };
		return await queryProduct({ query, limit, skip });
	}

	static async getListSearchProduct({ keySearch }) {
		return await searchProductByUser({ keySearch });
	}

	static async findAllProducts({
		limit = 50,
		sort = "ctime",
		page = 1,
		filter = { isPublished: true },
	}) {
		return await findAllProducts({
			limit,
			sort,
			page,
			filter,
			select: ["product_name", "product_thumb", "product_price"],
		});
	}

	static async findProduct({ product_id }) {
		return await findProduct({
			product_id,
			unselect: ["-__v", "-product_variations"],
		});
	}
}

class Product {
	constructor({
		product_name,
		product_thumb,
		product_description,
		product_price,
		product_quantity,
		product_type,
		product_shop,
		product_attributes,
	}) {
		this.product_name = product_name;
		this.product_thumb = product_thumb;
		this.product_description = product_description;
		this.product_price = product_price;
		this.product_quantity = product_quantity;
		this.product_type = product_type;
		this.product_shop = product_shop;
		this.product_attributes = product_attributes;
	}

	async createProduct() {
		const model = PRODUCT_TYPE_MODELS[this.product_type];
		if (!model) {
			throw new BadRequestError("Error: Invalid product type");
		}

		const newProduct = await model.create({ ...this });

		if (!newProduct) {
			throw new Error("Error: Failed to create product");
		}

		return newProduct;
	}

	async updateProduct(product_id) {
		const model = PRODUCT_TYPE_MODELS[this.product_type];
		if (!model) {
			throw new BadRequestError("Error: Invalid product type");
		}

		const objectParams = removeUndefinedObject(this);

		const updatedProduct = await updateProductById({
			product_id,
			bodyUpdate: updateNestedObjectParser(objectParams),
			model,
		});

		if (!updatedProduct) {
			throw new Error("Error: Failed to update product");
		}

		return updatedProduct;
	}
}

class Clothing extends Product {
	async createProduct() {
		return super.createProduct();
	}

	async updateProduct(product_id) {
		return super.updateProduct(product_id);
	}
}

class Electronic extends Product {
	async createProduct() {
		return super.createProduct();
	}

	async updateProduct(product_id) {
		return super.updateProduct(product_id);
	}
}

class Furniture extends Product {
	async createProduct() {
		return super.createProduct();
	}

	async updateProduct(product_id) {
		return super.updateProduct(product_id);
	}
}

// register product types
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronic", Electronic);
ProductFactory.registerProductType("Furniture", Furniture);

export default ProductFactory;
