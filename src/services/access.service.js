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
 * @class AccessService
 * @description Service class handling user access operations including signup and token refresh
 * @static
 */

/**
 * @method signUp
 * @static
 * @async
 * @description Handles user signup process including validation, password hashing, and token generation
 * @param {Object} params - The signup parameters
 * @param {string} params.name - User's name
 * @param {string} params.email - User's email
 * @param {string} params.password - User's password
 * @throws {Error} When required fields are missing
 * @throws {Error} When email already exists
 * @throws {Error} When signup process fails
 * @returns {Promise<Object>} Object containing status code and metadata
 * @returns {number} returns.code - HTTP status code (201 for success)
 * @returns {Object} returns.metadata - Contains shop information and tokens
 * @returns {Object} returns.metadata.shop - Shop information (_id, name, email)
 * @returns {Object} returns.metadata.tokens - Access and refresh tokens
 */

/**
 * @method refreshToken
 * @static
 * @async
 * @description Refreshes user authentication tokens
 * @param {string} refreshToken - Current refresh token
 * @throws {Error} When token refresh process fails
 * @returns {Promise<Object>} Object containing status code and new tokens
 * @returns {number} returns.code - HTTP status code (200 for success)
 * @returns {Object} returns.metadata - Contains new tokens
 * @returns {Object} returns.metadata.tokens - New access and refresh tokens
 */
class AccessService {
	static async signUp({ name, email, password }) {
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
			code: 201,
			metadata: {
				shop: getInfoData({
					fields: ['_id', 'name', 'email'],
					object: newShop
				}),
				tokens: { accessToken, refreshToken }
			}
		};
	}

	static async refreshToken(refreshToken) {
        try {
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
				code: 200,
				metadata: {
					tokens: { 
						accessToken,
						refreshToken: newRefreshToken // Include new refresh token
					}
				}
			};
        } catch (error) {
            throw new Error(`Refresh token failed: ${error.message}`);
        }
    }
}

export default AccessService
