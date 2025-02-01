import KeyTokenModel from "../models/keytoken.model.js"

/**
 * @class KeyTokenService
 * @description Service class for managing authentication tokens
 * @static
 */
/**
 * Creates a new key token for a user
 * @static
 * @async
 * @param {Object} params - The parameters for creating a key token
 * @param {string} params.userId - The ID of the user
 * @param {string|Object} params.publicKey - The public key for the token
 * @param {string} params.refreshToken - The refresh token
 * @returns {Promise<string>} The public key of the created token
 * @throws {Error} If token creation fails
 */
/**
 * Validates a refresh token
 * @static
 * @async
 * @param {string} refreshToken - The refresh token to validate
 * @returns {Promise<Object>} The validated token document
 * @throws {Error} If token validation fails or token is invalid
 */
/**
 * Revokes all active tokens for a user
 * @static
 * @async
 * @param {string} userId - The ID of the user whose tokens should be revoked
 * @returns {Promise<Object>} The result of the update operation
 */
/**
 * Updates an existing key token
 * @static
 * @async
 * @param {string} id - The ID of the token to update
 * @param {string} publicKey - The new public key
 * @param {string} refreshToken - The new refresh token
 * @returns {Promise<Object>} The updated token document
 * @throws {Error} If token update fails
 */
class KeyTokenService {
	static async createKeyToken({ userId, publicKey, refreshToken }) {
		try {
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
		} catch (error) {
			throw new Error(`KeyToken creation failed: ${error.message}`);
		}
	}

	static async validateRefreshToken(refreshToken) {
        try {
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
        } catch (error) {
            throw new Error(`Token validation failed: ${error.message}`);
        }
    }

	static async revokeToken(userId) {
		return await updateMany(
			{ user: userId, isRevoked: false },
			{ $set: { isRevoked: true } }
		);
	}

	static async updateKeyToken(id, publicKey, refreshToken) {
        try {
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
        } catch (error) {
            throw new Error(`KeyToken update failed: ${error.message}`);
        }
    }
}

export default KeyTokenService
