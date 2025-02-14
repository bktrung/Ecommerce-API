import { BadRequestError } from "../core/error.response.js";
import { createDiscount, findDiscountByCode } from "../models/repositories/discount.repo.js";
import { DISCOUNT_TYPES, APPLY_TYPES } from "../models/discount.model.js";
import { checkProductsExist } from "../models/repositories/product.repo.js";

/* This should be in another file, but i just use this one time 
   for practicing builder pattern so i just simply put it here, 
   future validation will use joi for faster setup */
class DiscountBuilder {
	constructor(shop) {
		this.discount = {
			shop,
			usageCount: 0,
			usersUsing: [],
			isActive: false,
		};
		this.errors = [];
	}

	withName(name) {
		if (!name || name.trim().length === 0) {
			this.errors.push("Discount name is required");
		}
		this.discount.name = name;
		return this;
	}

	withCode(code) {
		if (!code || code.trim().length === 0) {
			this.errors.push("Discount code is required");
		}
		if (code) {
			if (code.length < 8 || code.length > 20) {
				this.errors.push(
					"Discount code must be between 8 and 20 characters"
				);
			}
			if (!/^[A-Za-z0-9_-]+$/.test(code)) {
				this.errors.push(
					"Discount code can only contain letters, numbers, underscores and hyphens"
				);
			}
		}
		this.discount.code = code?.trim().toUpperCase();
		return this;
	}

	withValue(type, value, maxValue) {
		if (!type || !Object.values(DISCOUNT_TYPES).includes(type)) {
			this.errors.push("Invalid discount type");
		}

		if (!value || value <= 0) {
			this.errors.push("Discount value must be greater than 0");
		}

		if (type === DISCOUNT_TYPES.PERCENTAGE) {
			if (value > 100) {
				this.errors.push("Percentage discount cannot exceed 100%");
			}
			if (!maxValue || maxValue <= 0) {
				this.errors.push(
					"Max value is required for percentage discount"
				);
			}
		}

		this.discount.type = type;
		this.discount.value = value;
		this.discount.maxValue = maxValue;
		return this;
	}

	withUsage(maxUsage, maxUsagePerUser) {
		if (!maxUsage || maxUsage <= 0) {
			this.errors.push("Max usage must be greater than 0");
		}
		if (!maxUsagePerUser || maxUsagePerUser <= 0) {
			this.errors.push("Max usage per user must be greater than 0");
		}
		if (maxUsagePerUser > maxUsage) {
			this.errors.push("Max usage per user cannot exceed max usage");
		}

		this.discount.maxUsage = maxUsage;
		this.discount.maxUsagePerUser = maxUsagePerUser;
		return this;
	}

	withDates(startDate, endDate) {
		if (!startDate || !endDate) {
			this.errors.push("Start date and end date are required");
		}

		const now = new Date();
		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			this.errors.push("Invalid date format");
		} else {
			if (start >= end) {
				this.errors.push("Start date must be before end date");
			}
			if (end <= now) {
				this.errors.push("End date must be in the future");
			}
		}

		this.discount.startDate = startDate;
		this.discount.endDate = endDate;
		return this;
	}

	withProducts(appliesTo, productIds, minOrderValue) {
		if (!appliesTo || !Object.values(APPLY_TYPES).includes(appliesTo)) {
			this.errors.push("Invalid applies to value");
		}
		if (
			appliesTo === APPLY_TYPES.SPECIFIC &&
			(!productIds || productIds.length === 0)
		) {
			this.errors.push(
				"Product IDs are required when applies to specific products"
			);
		}
		if (!minOrderValue || minOrderValue < 0) {
			this.errors.push(
				"Minimum order value must be greater than or equal to 0"
			);
		}

		this.discount.appliesTo = appliesTo;
		this.discount.productIds = productIds;
		this.discount.minOrderValue = minOrderValue;
		return this;
	}

	build() {
		if (this.errors.length > 0) {
			throw new BadRequestError(this.errors.join(", "));
		}
		return this.discount;
	}
}

class DiscountService {
	static async createDiscount( payload ) {
		const {
			name, description, code,
			type, value, maxValue,
			maxUsage, maxUsagePerUser, minOrderValue,
			startDate, endDate,
			shop, appliesTo, productIds,
		} = payload;

		const existingDiscount = await findDiscountByCode({ code, shop });
		if (existingDiscount) {
			throw new BadRequestError("Discount code already exists");
		}

		if (appliesTo === APPLY_TYPES.SPECIFIC && productIds?.length > 0) {
			const { isValid, notFoundIds } = await checkProductsExist(productIds);
			if (!isValid) {
				throw new BadRequestError(`Products not found: ${notFoundIds.join(", ")}`);
			}
		}

		const discount = new DiscountBuilder(shop)
			.withName(name)
			.withCode(code)
			.withValue(type, value, maxValue)
			.withUsage(maxUsage, maxUsagePerUser)
			.withDates(startDate, endDate)
			.withProducts(appliesTo, productIds, minOrderValue)
			.build();

		discount.description = description;

		return await createDiscount(discount);
	}
}

export default DiscountService;