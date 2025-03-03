import Redis from 'ioredis';
import Redlock from 'redlock';

// Create Redis client
const client = new Redis({
	host: process.env.REDIS_HOST || 'localhost',
	port: process.env.REDIS_PORT || 6379,
	// Add any other Redis options here
});

// Log Redis connection events
client.on('connect', () => console.log('Redis client connected'));
client.on('error', (err) => console.error('Redis client error:', err));

// Create Redlock instance with optimal settings
const redlock = new Redlock(
	// You can use multiple clients for redundancy
	[client],
	{
		// Retry times
		retryCount: 10,
		// Time in ms between retries
		retryDelay: 200,
		// Time in ms added to retries for randomization
		retryJitter: 200,
		// Time in ms before lock expires (3s) - adjust based on your operations
		driftFactor: 0.01,
		// Automatically extend lock if operation takes >500ms
		automaticExtensionThreshold: 500
	}
);

// Set up error handler
redlock.on('error', (error) => {
	// Log the error, but don't crash the node process
	console.error('Redlock error:', error);
});

export { redlock, client };