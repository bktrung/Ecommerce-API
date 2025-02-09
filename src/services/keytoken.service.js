import { BadRequestError } from "../core/error.response.js";
import KeyTokenModel from "../models/keytoken.model.js"

/**
 * @class KeyTokenService
 * @description Handles token operations
 */
class KeyTokenService {
	/**
	 * @method createKeyToken
	 * @static
	 * @async
	 * @description Creates new key token for user by:
	 * - Setting 7-day expiration
	 * - Storing user ID, public key and refresh token
	 * - Validating successful creation
	 *
	 * @param {Object} params
	 * @param {string} params.userId - User ID for token
	 * @param {string|Object} params.publicKey - Public key to store
	 * @param {string} params.refreshToken - Refresh token to store
	 * @throws {Error} If token creation fails
	 * @returns {Promise<string>} Created token's public key
	 */
	static async createKeyToken({ userId, publicKey, refreshToken }) {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

		const token = await KeyTokenModel.create({
			user: userId,
			publicKey: publicKey.toString(),
			refreshToken,
			expiresAt,
		});

		if (!token) throw new Error("Error: Failed to create key token");
		return token.publicKey;
	}

	/**
	 * @method validateRefreshToken
	 * @static
	 * @async
	 * @description Validates refresh token by:
	 * - Finding token that matches refresh token
	 * - Checking if token is not revoked and not expired
	 * - Adding refresh token to used tokens list
	 * 
	 * @param {string} refreshToken - Token to validate 
	 * @throws {BadRequestError} If token is invalid
	 * @returns {Promise<Object>} Found and validated token document
	 */
	static async validateRefreshToken(refreshToken) {
		// Find token by refreshToken only
		const token = await KeyTokenModel.findOne({
			refreshToken,
			isRevoked: false,
			expiresAt: { $gt: new Date() },
		});

		if (!token) {
			throw new BadRequestError("Error: Invalid refresh token");
		}

		// Add token to used tokens list
		token.refreshTokensUsed.push(refreshToken);
		await token.save();

		return token;
	}

	/**
	 * @method revokeToken
	 * @static
	 * @async
	 * @description Revokes user tokens by:
	 * - Finding all active tokens
	 * - Setting revoked status
	 *
	 * @param {string} userId - User ID to revoke tokens for
	 * @returns {Promise<Object>} Bulk update result
	 */
	static async revokeToken(userId) {
		return await updateMany(
			{ user: userId, isRevoked: false },
			{ $set: { isRevoked: true } }
		);
	}

	/**
	 * @method updateKeyToken
	 * @static
	 * @async
	 * @description Updates token credentials by:
	 * - Finding existing token
	 * - Setting new expiration
	 * - Storing new public key and refresh token
	 *
	 * @param {string} id - Token ID to update
	 * @param {string} publicKey - New public key
	 * @param {string} refreshToken - New refresh token
	 * @throws {Error} If update fails
	 * @returns {Promise<Object>} Updated token document
	 */
	static async updateKeyToken(id, publicKey, refreshToken) {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
		const updatedToken = await KeyTokenModel.findByIdAndUpdate(
			id,
			{
				publicKey,
				refreshToken,
				expiresAt,
			},
			{ new: true }
		);
		if (!updatedToken) throw new Error("Error: Failed to update key token");
		return updatedToken;
	}
}

export default KeyTokenService