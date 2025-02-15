import { getAllDocuments } from "../../utils/index.js";
import { discount } from "../discount.model.js";
import { APPLY_TYPES } from "../discount.model.js";

export const findDiscountByCode = async ({ code, shop }) => {
	return await discount.findOne({ code, shop }).lean();
}

export const findDiscountById = async (discountId) => {
	return await discount.findById(discountId).lean();
}

export const getAllDiscounts = async ({ 
	limit, sort, page, filter, select 
}) => {
	return getAllDocuments(discount, {
		limit, sort, page, filter, select
	});
}

export const createDiscount = async (discountData) => {
	return await discount.create(discountData).lean();
};

export const activateDiscount = async (discountId) => {
	return await discount.findByIdAndUpdate(
		discountId, 
		{ isActive: true },
		{ new: true }
	).lean();
};

export const getAllProductDiscounts = async ({
	productId, shopId, filter, select
}) => {
	const now = new Date();

	const baseConditions = {
		...filter,
		shop: shopId,
		isActive: true,
		startDate: { $lte: now },
		endDate: { $gte: now },
	};

	return await discount.find({
        $or: [
            {
                ...baseConditions,
                appliesTo: APPLY_TYPES.SPECIFIC,
                productIds: productId
            },
            {
                ...baseConditions,
                appliesTo: APPLY_TYPES.ALL
            }
        ]
    })
    .select(select)
    .lean();
}