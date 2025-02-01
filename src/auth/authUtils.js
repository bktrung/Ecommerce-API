import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import { createHash } from 'crypto';

/**
 * Utility class for handling authentication-related operations
 */
class AuthUtils {
	/**
	 * Define token types constants
	 */
	static TOKEN_TYPES = {
		ACCESS: 'access',
		REFRESH: 'refresh'
	};

	/**
	 * Creates a pair of JWT tokens (access token and refresh token)
	 * @param {Object} payload - User data to encode in tokens
	 * @param {string} privateKey - RSA private key for signing tokens
	 * @returns {Object} Object containing accessToken and refreshToken
	 */
	static async createTokenPair(payload, privateKey) {
		try {
			// Extract only necessary user data for token payload
			const tokenPayload = {
				userId: payload.userId,
				email: payload.email,
				roles: payload.roles
			};

			// Generate access token with full user data
			const accessToken = sign(
				{
					...tokenPayload,
					type: this.TOKEN_TYPES.ACCESS
				},
				privateKey,
				{
					algorithm: 'RS256', // Use RSA SHA-256 signing algorithm
					expiresIn: '2d',    // Token expires in 2 days
					notBefore: '0s',     // Token is valid immediately
					jwtid: createHash('sha256').update(Math.random().toString()).digest('hex') // Unique token ID
				}
			);

			// Generate refresh token with minimal user data
			const refreshToken = sign(
				{
					userId: payload.userId,
					type: this.TOKEN_TYPES.REFRESH
				},
				privateKey,
				{
					algorithm: 'RS256',
					expiresIn: '7d',    // Refresh token valid for 7 days
					notBefore: '0s',
					jwtid: createHash('sha256').update(Math.random().toString()).digest('hex')
				}
			);

			return { accessToken, refreshToken };
		} catch (error) {
			throw new Error(`Token generation failed: ${error.message}`);
		}
	}

	/**
	 * Verifies the validity of a JWT token
	 * @param {string} token - Token to verify
	 * @param {string} publicKey - RSA public key for verification
	 * @returns {Object} Decoded token payload if verification succeeds
	 */
	static async verifyToken(token, publicKey) {
		try {
			return verify(token, publicKey, {
				algorithms: ['RS256'] // Only accept RS256 algorithm
			});
		} catch (error) {
			throw new Error(`Token verification failed: ${error.message}`);
		}
	}
}

export default AuthUtils;
