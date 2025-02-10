import { BadRequestError } from '../core/error.response.js';
import { product, clothing, electronic, furniture } from '../models/product.model.js';

class ProductFactory {
	static productRegistry = {};

	static registerProductType(type, productClass) {
		ProductFactory.productRegistry[type] = productClass;
	}

	static async createProduct(type, attributes) {
		const productClass = ProductFactory.productRegistry[type];
		if (!productClass) {
			throw BadRequestError("Error: Invalid product type");
		}

		return new productClass(attributes).createProduct();
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
}

class Electronic extends Product {
	async createProduct() {
		const newElectronic = await electronic.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});

		if (!newElectronic) {
			throw new BadRequestError("Failed to create electronic product");
		}

		const newProduct = await super.createProduct(newElectronic._id);
		if (!newProduct) {
			throw new BadRequestError("Failed to create product");
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
			throw new BadRequestError("Failed to create furniture product");
		}

		const newProduct = await super.createProduct(newFurniture._id);
		if (!newProduct) {
			throw new BadRequestError("Failed to create product");
		}

		return newProduct;
	}
}

// register product types
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronic", Electronic);
ProductFactory.registerProductType("Furniture", Furniture);

export default ProductFactory;