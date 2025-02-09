import ShopModel from "../models/shop.model.js"
import { hash, compare } from 'bcrypt'
import KeyTokenService from "./keytoken.service.js"
import AuthUtils from "../auth/authUtils.js"
import { getInfoData } from "../utils/index.js"
import { BadRequestError, AuthFailureError } from "../core/error.response.js";
import ShopService from "./shop.service.js"

const RoleShop = {
	SHOP: 'SHOP',
	WRITER: 'WRITER',
	EDITER: 'EDITER',
	ADMIN: 'ADMIN'
}

/**
 * @class AccessService
 * @description Handles user authentication including signup, login and token management
 */
class AccessService {
	/**
	 * @method signUp
	 * @static
	 * @async
	 * @description Handles new shop registration by:
	 * - Validating required fields
	 * - Checking email uniqueness
	 * - Hashing password
	 * - Creating shop record
	 * - Generating auth tokens
	 * - Storing token info
	 *
	 * @param {Object} params
	 * @param {string} params.name - Shop name
	 * @param {string} params.email - Email address
	 * @param {string} params.password - Password
	 * @throws {BadRequestError} If required fields missing or email exists
	 * @returns {Promise<Object>} Shop info and auth tokens
	 */
	static async signUp({ name, email, password }) {
		// Check for required fields
		if (!name || !email || !password) {
			throw new BadRequestError("Error: Missing required fields");
		}

		// Check email existence
		const existingShop = await ShopService.findByEmail({ email });
		if (existingShop) {
			throw new BadRequestError("Error: Email already exists");
		}

		// Hash password with appropriate cost factor
		const passwordHash = await hash(password, 10);

		// Create shop with minimal required data
		const newShop = await ShopModel.create({
			name,
			email,
			password: passwordHash,
			roles: [RoleShop.SHOP],
		});

		// Generate key pair
		const { privateKey, publicKey } = AuthUtils.generateKeyPair();

		// Create tokens
		const { accessToken, refreshToken } = AuthUtils.createTokenPair(
			{ userId: newShop._id, email },
			privateKey
		);

		// Store token info
		await KeyTokenService.createKeyToken({
			userId: newShop._id,
			publicKey,
			refreshToken,
		});

		return {
			shop: getInfoData({
				fields: ["_id", "name", "email"],
				object: newShop,
			}),
			tokens: { accessToken, refreshToken },
		};
	}

	/**
	 * @method refreshToken
	 * @static
	 * @async
	 * @description Refreshes authentication by:
	 * - Validating refresh token
	 * - Verifying token signature
	 * - Generating new token pair
	 * - Updating stored tokens
	 *
	 * @param {Object} params
	 * @param {string} params.refreshToken - Current refresh token
	 * @returns {Promise<Object>} New auth tokens
	 */
	static async refreshToken({ refreshToken }) {
		const keyToken = await KeyTokenService.validateRefreshToken(
			refreshToken
		);
		const publicKey = keyToken.publicKey;

		// Verify the refresh token
		const { userId, email } = AuthUtils.verifyToken(
			refreshToken,
			publicKey
		);

		// Generate new tokens
		const { privateKey, publicKey: newPublicKey } =
			AuthUtils.generateKeyPair();

		// Create new token pair
		const { accessToken, refreshToken: newRefreshToken } =
			AuthUtils.createTokenPair({ userId, email }, privateKey);

		// Update the refresh token in the database
		await KeyTokenService.updateKeyToken(
			keyToken._id,
			newPublicKey,
			newRefreshToken
		);

		return {
			tokens: {
				accessToken,
				refreshToken: newRefreshToken, // Include new refresh token
			},
		};
	}

	/**
	 * @method login
	 * @static
	 * @async
	 * @description Authenticates shop login by:
	 * - Validating credentials
	 * - Verifying password
	 * - Generating auth tokens
	 *
	 * @param {Object} params
	 * @param {string} params.email - Email address
	 * @param {string} params.password - Password
	 * @throws {AuthFailureError} If invalid credentials
	 * @returns {Promise<Object>} Shop info and auth tokens
	 */
	static async login({ email, password }) {
		// Check for required fields
		if (!email || !password) {
			throw new BadRequestError("Error: Missing required fields");
		}

		// Check email existence
		const shop = await ShopService.findByEmail({ email });
		if (!shop) {
			throw new AuthFailureError("Error: Email or password is incorrect");
		}

		// Check password
		const isMatch = await compare(password, shop.password);
		if (!isMatch) {
			throw new AuthFailureError("Error: Email or password is incorrect");
		}

		// Generate key pair
		const { privateKey, publicKey } = AuthUtils.generateKeyPair();

		// Create tokens
		const { accessToken, refreshToken } = AuthUtils.createTokenPair(
			{ userId: shop._id, email },
			privateKey
		);

		// Store token info
		await KeyTokenService.createKeyToken({
			userId: shop._id,
			publicKey,
			refreshToken,
		});

		return {
			shop: getInfoData({
				fields: ["_id", "name", "email"],
				object: shop,
			}),
			tokens: { accessToken, refreshToken },
		};
	}
}

export default AccessService
