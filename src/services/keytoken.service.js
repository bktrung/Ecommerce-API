import KeyTokenModel from "../models/keytoken.model.js"

/**
 * @class KeyTokenService
 * @description Service class for managing authentication tokens with public/private key pairs
 * @static
 */

/**
 * Creates a new key token for a user with a 7-day expiration
 * @static
 * @async
 * @param {Object} params - The parameters for creating a key token
 * @param {string} params.userId - The ID of the user
 * @param {string|Object} params.publicKey - The public key for the token (will be converted to string)
 * @param {string} params.refreshToken - The refresh token to be stored
 * @returns {Promise<string>} The public key of the created token
 * @throws {Error} If token creation fails in the database
 */

/**
 * Validates a refresh token and marks it as used
 * @static
 * @async
 * @param {string} refreshToken - The refresh token to validate
 * @returns {Promise<Object>} The validated token document including user reference
 * @throws {Error} If token is expired, revoked, or not found in database
 */

/**
 * Revokes all active tokens for a specific user
 * @static
 * @async
 * @param {string} userId - The ID of the user whose tokens should be revoked
 * @returns {Promise<Object>} The result of the bulk update operation
 */

/**
 * Updates an existing key token with new credentials and extends expiration
 * @static
 * @async
 * @param {string} id - The ID of the token document to update
 * @param {string} publicKey - The new public key to store
 * @param {string} refreshToken - The new refresh token to store
 * @returns {Promise<Object>} The updated token document with new expiration
 * @throws {Error} If token update fails or document not found
 */
class KeyTokenService {
	static async createKeyToken({ userId, publicKey, refreshToken }) {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

		const token = await KeyTokenModel.create({
			user: userId,
			publicKey: publicKey.toString(),
			refreshToken,
			expiresAt
		});

		if (!token) throw new Error('Failed to create key token');
		return token.publicKey;
	}

	static async validateRefreshToken(refreshToken) {
		// Find token by refreshToken only
		const token = await KeyTokenModel.findOne({
			refreshToken,
			isRevoked: false,
			expiresAt: { $gt: new Date() }
		});

		if (!token) {
			throw new Error('Invalid refresh token');
		}

		// Add token to used tokens list
		token.refreshTokensUsed.push(refreshToken);
		await token.save();

		return token;
    }

	static async revokeToken(userId) {
		return await updateMany(
			{ user: userId, isRevoked: false },
			{ $set: { isRevoked: true } }
		);
	}

	static async updateKeyToken(id, publicKey, refreshToken) {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
		const updatedToken = await KeyTokenModel.findByIdAndUpdate(
			id,
			{
				publicKey,
				refreshToken,
				expiresAt
			},
			{ new: true }
		);
		if (!updatedToken) throw new Error('Failed to update key token');
		return updatedToken;
    }
}

export default KeyTokenService