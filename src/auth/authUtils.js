import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import { createHash, generateKeyPairSync } from "crypto";
import { asyncHandler } from '../helpers/asyncHandler.js';
import { AuthFailureError, NotFoundError } from '../core/error.response.js';
import KeyTokenService from '../services/keytoken.service.js';


const TOKEN_TYPES = {
	ACCESS: "access",
	REFRESH: "refresh",
};

const HEADER = {
	AUTHORIZATION: "authorization",
	CLIENT_ID: "client-id",
};

/**
 * @function createTokenPair
 * @description Generates a pair of JWT tokens (access and refresh) by:
 * - Extracting necessary user data
 * - Creating access token with full user data (userId, email, roles)
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
export const createTokenPair = (payload, privateKey) => {
	try {
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
				type: TOKEN_TYPES.ACCESS,
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
				type: TOKEN_TYPES.REFRESH,
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
	} catch (error) {
		throw new Error(`Error creating token pair: ${error.message}`);
	}
}

/**
 * @function verifyToken
 * @description Verifies the validity of a JWT token using RSA public key
 *
 * @param {string} token - JWT token to verify
 * @param {string} publicKey - RSA public key for token verification
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token, publicKey) => {
	try {
		return verify(token, publicKey, {
			algorithms: ["RS256"], // Only accept RS256 algorithm
		});
	} catch (error) {
		throw new Error(`Error verifying token: ${error.message}`);
	}
}

/**
 * @function generateKeyPair
 * @description Generates a new RSA key pair for token signing/verification
 * - Uses 4096 bit key length
 * - Creates keys in PKCS1 PEM format
 *
 * @returns {Promise<Object>} Object containing public and private keys
 */
export const generateKeyPair = () => {
	try {
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
	} catch (error) {
		throw new Error(`Error generating key pair: ${error.message}`);
	}
}

export const authentication = asyncHandler(async (req, res, next) => {
	const userId = req.headers[HEADER.CLIENT_ID];
	if (!userId) {
		throw new AuthFailureError("Error: Invalid request");
	}

	const keyToken = await KeyTokenService.findByUserId(userId);
	if (!keyToken) {
		throw new NotFoundError("Error: Key token not found");
	}

	if (keyToken.isRevoked) {
		throw new AuthFailureError("Error: Key token revoked");
	}

	const accessToken = req.headers[HEADER.AUTHORIZATION];
	if (!accessToken) {
		throw new AuthFailureError("Error: Invalid request");
	}

	try {
		const decodeUser = verifyToken(accessToken, keyToken.publicKey);
		if (decodeUser.userId !== userId) {
			throw new AuthFailureError("Error: Invalid request");
		}
		req.keyToken = keyToken;
		return next();
	} catch (error) {
		throw new AuthFailureError("Error: Invalid token");
	}
});