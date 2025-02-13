import { findShop } from "../models/repositories/shop.repo";

/**
 * @class ShopService
 * @description Service class for handling shop-related operations like finding shops by email
 */
class ShopService {
	/**
	 * @method findByEmail
	 * @static
	 * @async
	 * @description Finds a shop document by email address and returns selected fields
	 *
	 * @param {Object} params - Search parameters
	 * @param {string} params.email - Email address to search for
	 * @param {Object} [params.select] - Fields to select/project in the returned document
	 * @returns {Promise<Object|null>} Found shop document or null if not found
	 */
	static async findByEmail({
		email,
		select = { email: 1, password: 1, name: 1, status: 1, roles: 1 },
	}) {
		return await findShop({ filter: { email }, select });
	}
}

export default ShopService;