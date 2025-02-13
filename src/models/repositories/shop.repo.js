import ShopModel from "../models/shop.model.js";

/**
 * @function findShop
 * @description Finds a shop document by filter criteria and returns selected fields
 * @param {Object} filter - MongoDB filter criteria
 * @param {Object} select - Fields to select/project
 * @returns {Promise<Object|null>} Found shop document or null
 */
export const findShop = async ({ filter = {}, select = {} }) => {
	return await ShopModel.findOne(filter).select(select).lean();
};
