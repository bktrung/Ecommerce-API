import { Types } from "mongoose";
import { discount } from "../discount.model.js";

export const findDiscountByCode = async ({ code, shop }) => {
	return await discount.findOne({ code, shop }).lean();
}

export const createDiscount = async (discountData) => {
	return await discount.create(discountData);
};