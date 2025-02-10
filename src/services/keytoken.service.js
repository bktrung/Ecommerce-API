import { Types } from "mongoose";
import { BadRequestError, ForbiddenError } from "../core/error.response.js";
import KeyTokenModel from "../models/keytoken.model.js"
import { verifyToken } from "../auth/authUtils.js";

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

		// For single device login
		const filter = { user: userId };
		const update = {
			publicKey: publicKey.toString(),
			refreshToken,
			expiresAt,
			isRevoked: false,
			refreshTokensUsed: [], // Reset used tokens when creating/updating
		};
		const options = { upsert: true, new: true };

		const token = await KeyTokenModel.findOneAndUpdate(
			filter,
			update,
			options
		).lean();

		if (!token)
			throw new Error("Error: Failed to create or update key token");

		return token.publicKey;
	}

	/**
	 * @method validateRefreshToken
	 * @static
	 * @async  
	 * @description Validates refresh token by:
	 * - Checking if token was previously used
	 * - Finding active token matching refresh token
	 * - Verifying token is not revoked
	 * - Adding refresh token to used tokens list
	 * 
	 * @param {string} refreshToken - Token to validate
	 * @throws {ForbiddenError} If token was previously used
	 * @throws {BadRequestError} If token is invalid or revoked
	 * @throws {Error} If failed to update token
	 * @returns {Promise<Object>} Updated token document
	 */
	static async validateRefreshToken(refreshToken) {
		// Check if token is used
		const usedToken = await this.findByRefreshTokenUsed(refreshToken);
		if (usedToken) {
			await this.revokeToken(usedToken._id);
			throw new ForbiddenError("Error: Something went wrong. Please login again.");
		}

		// Find token by refreshToken only
		const token = await this.findByRefreshToken(refreshToken);

		if (!token) {
			throw new BadRequestError("Error: Invalid refresh token");
		}

		if (token.isRevoked) {
			throw new BadRequestError("Error: Token has been revoked");
		}

		const updatedToken = await KeyTokenModel.findOneAndUpdate(
			{ _id: token._id },
			{ $push: { refreshTokensUsed: refreshToken } },
			{ new: true }
		);

		if (!updatedToken) {
			throw new Error("Error: Failed to update key token");
		}

		return updatedToken;
	}

	/**
	 * @method revokeToken
	 * @static
	 * @async
	 * @description Revokes a specific token by:
	 * - Finding the token by ID
	 * - Setting revoked status
	 *
	 * @param {string} tokenId - Token ID to revoke
	 * @returns {Promise<Object>} Updated token document
	 */
	static async revokeToken(tokenId) {
		return await KeyTokenModel.findByIdAndUpdate(
			tokenId,
			{ isRevoked: true },
			{ new: true }
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

	/**
	 * Find a key token by user ID.
	 * @static
	 * @async
	 * @param {string} userId - The ID of the user to find the key token for
	 * @returns {Promise<Object|null>} The key token document if found, null otherwise
	 */
	static async findByUserId(userId) {
		return await KeyTokenModel.findOne({ user: new Types.ObjectId(userId) }).lean();
	}

	/**
	 * Find a key token by public key.
	 * @static
	 * @async
	 * @param {string} publicKey - The public key to find the key token for
	 * @returns {Promise<Object|null>} The key token document if found, null otherwise
	 */
	static async findByRefreshToken(refreshToken) {
		return await KeyTokenModel.findOne({
			refreshToken,
			isRevoked: false,
			expiresAt: { $gt: new Date() },
		}).lean();
	}

	/**
	 * Find a key token by used refresh token.
	 * @static
	 * @async
	 * @param {string} refreshToken - The refresh token to find the key token for
	 * @returns {Promise<Object|null>} The key token document if found, null otherwise
	 */
	static async findByRefreshTokenUsed(refreshToken) {
		return await KeyTokenModel.findOne({
			refreshTokensUsed: refreshToken,
		}).lean();
	}
}

export default KeyTokenService