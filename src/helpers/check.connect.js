import { connections } from "mongoose";
import { cpus } from "os";

/**
 * @function countConnect
 * @description Counts and logs the current number of active MongoDB connections
 * @returns {void}
 */
const countConnect = () => {
	const numConnections = connections.length;
	console.log(`Number of connections: ${numConnections}`);
};

/**
 * @function checkOverload
 * @description Monitors system for connection overload by:
 * - Checking connection count against CPU core count
 * - Monitoring memory usage
 * - Alerting if connections exceed threshold (2 per CPU core)
 * - Running checks every 5 seconds
 * @returns {void}
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
