import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import { createHash } from 'crypto';

class AuthUtils {
	static TOKEN_TYPES = {
		ACCESS: 'access',
		REFRESH: 'refresh'
	};

	static async createTokenPair(payload, privateKey, publicKey) {
		try {
			// Remove sensitive data from payload
			const tokenPayload = {
				userId: payload.userId,
				email: payload.email,
				roles: payload.roles
			};

			const accessToken = sign(
				{
					...tokenPayload,
					type: this.TOKEN_TYPES.ACCESS
				},
				privateKey,
				{
					algorithm: 'RS256',
					expiresIn: '2d',
					notBefore: '0s', // Token is valid immediately
					jwtid: createHash('sha256').update(Math.random().toString()).digest('hex')
				}
			);

			const refreshToken = sign(
				{
					userId: payload.userId,
					type: this.TOKEN_TYPES.REFRESH
				},
				privateKey,
				{
					algorithm: 'RS256',
					expiresIn: '7d',
					notBefore: '0s',
					jwtid: createHash('sha256').update(Math.random().toString()).digest('hex')
				}
			);

			return { accessToken, refreshToken };
		} catch (error) {
			throw new Error(`Token generation failed: ${error.message}`);
		}
	}

	static async verifyToken(token, publicKey) {
		try {
			return verify(token, publicKey, {
				algorithms: ['RS256']
			});
		} catch (error) {
			throw new Error(`Token verification failed: ${error.message}`);
		}
	}
}

export default AuthUtils;
