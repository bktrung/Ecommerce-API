import ShopModel from "../models/shop.model.js"
import { hash } from 'bcrypt'
import { generateKeyPairSync } from 'crypto'
import KeyTokenService from "./keytoken.service.js"
import AuthUtils from "../auth/authUtils.js"
import { getInfoData } from "../utils/index.js"
import { BadRequestError } from "../core/error.response.js";

const RoleShop = {
	SHOP: 'SHOP',
	WRITER: 'WRITER',
	EDITER: 'EDITER',
	ADMIN: 'ADMIN'
}

/**
 * @enum {string} RoleShop - Enum for different shop roles
 * @readonly
 * @property {string} SHOP - Basic shop role
 * @property {string} WRITER - Content writer role
 * @property {string} EDITER - Content editor role
 * @property {string} ADMIN - Administrator role
 */

/**
 * @class AccessService
 * @description Service class handling user authentication and authorization
 * @static
 */

/**
 * @method signUp
 * @static
 * @async
 * @description Creates a new shop account with the following steps:
 * 1. Validates required fields (name, email, password)
 * 2. Checks if email is already registered
 * 3. Hashes password using bcrypt with salt rounds of 10
 * 4. Creates new shop document with SHOP role
 * 5. Generates RSA key pair (4096 bits)
 * 6. Creates JWT token pair (access + refresh)
 * 7. Stores public key and refresh token
 * 
 * @param {Object} signUpData
 * @param {string} signUpData.name - Shop name
 * @param {string} signUpData.email - Shop email address
 * @param {string} signUpData.password - Shop password (plain text)
 * @throws {BadRequestError} When required fields are missing
 * @throws {BadRequestError} When email already exists
 * @returns {Promise<Object>} 
 * {
 *   code: 201,
 *   metadata: {
 *     shop: {_id, name, email},
 *     tokens: {accessToken, refreshToken}
 *   }
 * }
 */

/**
 * @method refreshToken
 * @static
 * @async
 * @description Refreshes authentication tokens with the following steps:
 * 1. Validates provided refresh token
 * 2. Verifies token signature using stored public key
 * 3. Generates new RSA key pair (4096 bits)
 * 4. Creates new JWT token pair
 * 5. Updates stored public key and refresh token
 * 
 * @param {string} refreshToken - Current valid refresh token
 * @returns {Promise<Object>}
 * {
 *   code: 200,
 *   metadata: {
 *     tokens: {accessToken, refreshToken}
 *   }
 * }
 */
class AccessService {
	static async signUp({ name, email, password }) {
		// Check for required fields
		if (!name || !email || !password) {
			throw new BadRequestError('Error: Missing required fields');
		}

		// Check email existence
		const existingShop = await ShopModel.findOne({ email }).lean();
		if (existingShop) {
			throw new BadRequestError('Error: Email already exists');
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

		// Generate key pair with appropriate key size
		const { privateKey, publicKey } = generateKeyPairSync('rsa', {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: 'pkcs1',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs1',
				format: 'pem'
			}
		});

		// Create tokens
		const { accessToken, refreshToken } = 
			await AuthUtils.createTokenPair(
				{ userId: newShop._id, email },
				privateKey
			);

		// Store token info
		await KeyTokenService.createKeyToken({
			userId: newShop._id,
			publicKey,
			refreshToken
		});

		return {
			shop: getInfoData({
				fields: ['_id', 'name', 'email'],
				object: newShop
			}),
			tokens: { accessToken, refreshToken }
		};
	}

	static async refreshToken(refreshToken) {
		const keyToken = await KeyTokenService.validateRefreshToken(refreshToken);
		const publicKey = keyToken.publicKey;

		// Verify the refresh token
		const { userId, email } = await AuthUtils.verifyToken(refreshToken, publicKey);

		// Generate new tokens
		const { privateKey, publicKey: newPublicKey } = generateKeyPairSync('rsa', {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: 'pkcs1',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs1',
				format: 'pem'
			}
		});

		const { accessToken, refreshToken: newRefreshToken } = await AuthUtils.createTokenPair(
			{ userId, email },
			privateKey
		);

		// Update the refresh token in the database
		await KeyTokenService.updateKeyToken(keyToken._id, newPublicKey, newRefreshToken);

		return {
			tokens: { 
				accessToken,
				refreshToken: newRefreshToken // Include new refresh token
			}
		};
    }
}

export default AccessService
