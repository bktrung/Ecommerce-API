import ShopModel from "../models/shop.model.js"
import { hash } from 'bcrypt'
import { generateKeyPairSync, createPublicKey } from 'crypto'
import KeyTokenService from "./keytoken.service.js"
import AuthUtils from "../auth/authUtils.js"
import { getInfoData } from "../utils/index.js"

const RoleShop = {
	SHOP: 'SHOP',
	WRITER: 'WRITER',
	EDITER: 'EDITER',
	ADMIN: 'ADMIN'
}

class AccessService {
	static async signUp({ name, email, password }) {
		try {
			// Input validation
			if (!email || !password || !name) {
				throw new Error('Missing required fields');
			}

			// Check email existence
			const existingShop = await ShopModel.findOne({ email }).lean();
			if (existingShop) {
				throw new Error('Email already exists');
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
					privateKey,
					publicKey
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
		} catch (error) {
			throw new Error(`Signup failed: ${error.message}`);
		}
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
				privateKey,
				newPublicKey
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
