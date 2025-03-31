import redis from 'redis';
import { promisify } from 'util';
import { reservationInventory } from '../models/repositories/inventory.repo';

const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pexpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setnx).bind(redisClient);

export const acquireLock = async (productId, quantity, cartId) => {
	const key = `lock_v2025_:${productId}`;
	const retryTimes = 10;
	const expireTime = 3000; // 3 seconds

	for (let i = 0; i < retryTimes; i++) {
		try {
			const result = await setnxAsync(key, cartId);
			if (result === 1) {
				// Set expiration immediately to prevent orphaned locks
				await pexpire(key, expireTime);

				const isReservation = await reservationInventory(productId, cartId, quantity);

				if (isReservation) {
					return key; // Lock acquired and reservation successful
				} else {
					// Release lock if reservation failed
					await releaseLock(key);
					return null;
				}
			}
			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, 100));
		} catch (error) {
			// Release lock on error
			await releaseLock(key);
			throw error;
		}
	}

	// All retry attempts failed
	return null;
}

export const releaseLock = async (keyLock) => {
	const delAsyncKey = promisify(redisClient.del).bind(redisClient);
	return await delAsyncKey(keyLock);
}