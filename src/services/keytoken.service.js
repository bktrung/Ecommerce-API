import KeyTokenModel from "../models/keytoken.model.js"

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
