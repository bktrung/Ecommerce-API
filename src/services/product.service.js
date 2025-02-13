import { BadRequestError } from "../core/error.response.js";
import { product } from "../models/product.model.js";
import { insertInventory } from "../models/repositories/inventory.repo.js";
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
		const query = { shop: product_shop, isDraft: true };
		return await queryProduct({ query, limit, skip });
	}

	static async findAllPublishedForShop({ product_shop, limit = 50, skip = 0 }) {
		const query = { shop: product_shop, isPublished: true };
		return await queryProduct({ query, limit, skip });
	}

	static async getListSearchProduct({ keySearch }) {
		return await searchProductByUser({ keySearch });
	}

	static async findAllProducts({
		limit = 50, sort = "ctime", page = 1,
		filter = { isPublished: true },
	}) {
		return await findAllProducts({
			limit, sort, page, filter,
			select: ["name", "thumb", "price"],
		});
	}

	static async findProduct({ product_id }) {
		return await findProduct({
			product_id,
			unselect: ["-__v", "-variations"],
		});
	}
}

class Product {
	constructor({ 
		name, thumb, description, price,
		quantity, type, shop, attributes,
	}) {
		this.name = name;
		this.thumb = thumb;
		this.description = description;
		this.price = price;
		this.quantity = quantity;
		this.type = type;
		this.shop = shop;
		this.attributes = attributes;
	}

	async createProduct() {
		const model = product.discriminators[this.type];
		if (!model) {
			throw new BadRequestError("Error: Invalid product type");
		}

		const newProduct = await model.create({ ...this });

		if (!newProduct) {
			throw new Error("Error: Failed to create product");
		}

		await insertInventory(
			newProduct._id,
			newProduct.shop,
			newProduct.quantity,
		);

		return newProduct;
	}

	async updateProduct(product_id) {
		const model = product.discriminators[this.type];
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