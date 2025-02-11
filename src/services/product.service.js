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
			unselect: ["__v", "product_variations"],
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

	async createProduct(product_id) {
		return await product.create({
			...this,
			_id: product_id,
		});
	}

	async updateProduct(product_id, bodyUpdate) {
		return await updateProductById({
			product_id,
			bodyUpdate,
			model: product,
		});
	}
}

class Clothing extends Product {
	async createProduct() {
		const newColothing = await clothing.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});

		if (!newColothing) {
			throw new BadRequestError("Error: Failed to create clothing product");
		}

		const newProduct = await super.createProduct(newColothing._id);
		if (!newProduct) {
			throw new BadRequestError("Error: Failed to create product");
		}

		return newProduct;
	}

	async updateProduct(product_id) {
		const objectParams = removeUndefinedObject(this);
		if (objectParams.product_attributes) {
			await updateProductById({
				product_id,
				bodyUpdate: updateNestedObjectParser(
					objectParams.product_attributes
				),
				model: clothing,
			});
		}

		const updateProduct = await super.updateProduct(
			product_id,
			updateNestedObjectParser(objectParams)
		);

		return updateProduct;
	}
}

class Electronic extends Product {
	async createProduct() {
		const newElectronic = await electronic.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});

		if (!newElectronic) {
			throw new BadRequestError("Error: Failed to create electronic product");
		}

		const newProduct = await super.createProduct(newElectronic._id);
		if (!newProduct) {
			throw new BadRequestError("Error: Failed to create product");
		}

		return newProduct;
	}
}

class Furniture extends Product {
	async createProduct() {
		const newFurniture = await furniture.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});

		if (!newFurniture) {
			throw new BadRequestError("Error: Failed to create furniture product");
		}

		const newProduct = await super.createProduct(newFurniture._id);
		if (!newProduct) {
			throw new BadRequestError("Error: Failed to create product");
		}

		return newProduct;
	}
}

// register product types
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronic", Electronic);
ProductFactory.registerProductType("Furniture", Furniture);

export default ProductFactory;
