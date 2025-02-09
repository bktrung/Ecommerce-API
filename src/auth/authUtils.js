import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import { createHash, generateKeyPairSync } from "crypto";

/**
 * @class AuthUtils
 * @description Utility class for handling authentication-related operations including:
 * - token generation
 * - verification 
 * - key pair management
 */
class AuthUtils {
	static TOKEN_TYPES = {
		ACCESS: "access",
		REFRESH: "refresh",
	};

	/**
	 * @method createTokenPair
	 * @static
	 * @description Generates a pair of JWT tokens (access and refresh) by:
	 * - Extracting necessary user data
	 * - Creating access token with full user data
	 * - Creating refresh token with minimal user data
	 * - Using RSA SHA-256 signing
	 *
	 * @param {Object} payload - User data for token generation
	 * @param {string} payload.userId - Unique identifier of the user
	 * @param {string} payload.email - Email address of the user
	 * @param {Array} payload.roles - User roles/permissions
	 * @param {string} privateKey - RSA private key for token signing
	 * @returns {Promise<Object>} Object containing access and refresh tokens
	 */
	static createTokenPair(payload, privateKey) {
		// Extract only necessary user data for token payload
		const tokenPayload = {
			userId: payload.userId,
			email: payload.email,
			roles: payload.roles,
		};

		// Generate access token with full user data
		const accessToken = sign(
			{
				...tokenPayload,
				type: this.TOKEN_TYPES.ACCESS,
			},
			privateKey,
			{
				algorithm: "RS256", // Use RSA SHA-256 signing algorithm
				expiresIn: "2d", // Token expires in 2 days
				notBefore: "0s", // Token is valid immediately
				jwtid: createHash("sha256")
					.update(Math.random().toString())
					.digest("hex"), // Unique token ID
			}
		);

		// Generate refresh token with minimal user data
		const refreshToken = sign(
			{
				userId: payload.userId,
				type: this.TOKEN_TYPES.REFRESH,
			},
			privateKey,
			{
				algorithm: "RS256",
				expiresIn: "7d", // Refresh token valid for 7 days
				notBefore: "0s",
				jwtid: createHash("sha256")
					.update(Math.random().toString())
					.digest("hex"),
			}
		);

		return { accessToken, refreshToken };
	}

	/**
	 * @method verifyToken
	 * @static
	 * @description Verifies the validity of a JWT token using RSA public key
	 *
	 * @param {string} token - JWT token to verify
	 * @param {string} publicKey - RSA public key for token verification
	 * @returns {Object} Decoded token payload
	 */
	static verifyToken(token, publicKey) {
		return verify(token, publicKey, {
			algorithms: ["RS256"], // Only accept RS256 algorithm
		});
	}

	/**
	 * @method generateKeyPair
	 * @static
	 * @description Generates a new RSA key pair for token signing/verification
	 * - Uses 4096 bit key length
	 * - Creates keys in PKCS1 PEM format
	 *
	 * @returns {Promise<Object>} Object containing public and private keys
	 */
	static generateKeyPair() {
		return generateKeyPairSync("rsa", {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: "pkcs1",
				format: "pem",
			},
			privateKeyEncoding: {
				type: "pkcs1",
				format: "pem",
			},
		});
	}
}

export default AuthUtils;