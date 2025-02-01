import { connections } from "mongoose";
import { cpus } from "os";

/**
 * Count and log the current number of MongoDB connections
 */
const countConnect = () => {
	const numConnections = connections.length;
	console.log(`Number of connections: ${numConnections}`);
};

/**
 * Monitor system for connection overload
 * Checks connections against CPU cores and memory usage every 5 seconds
 */
const checkOverload = () => {
	const _SECONDS = 5000; // 5 seconds interval for monitoring

	setInterval(() => {
		const numConnections = connections.length;
		const numCores = cpus().length;
		const memoryUsage = process.memoryUsage().rss;

		// Calculate maximum connections based on CPU cores
		// Rule of thumb: 2 connections per CPU core
		const maxConnections = numCores * 2;

		// Log current memory usage in MB
		console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

		// Alert if connections exceed the maximum threshold
		if (numConnections > maxConnections) {
			console.log(
				`Number of connections: ${numConnections} is overloading`
			);
		}
	}, _SECONDS);
};

export default {
	countConnect,
	checkOverload,
};
