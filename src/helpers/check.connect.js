import { connections } from "mongoose";
import { cpus } from "os";

const countConnect = () => {
	const numConnections = connections.length;
	console.log(`Number of connections: ${numConnections}`);
};

const checkOverload = () => {
	const _SECONDS = 5000; // 5 seconds

	setInterval(() => {
		const numConnections = connections.length;
		const numCores = cpus().length;
		const memoryUsage = process.memoryUsage().rss;

		// check if the number of connections is overloading
		const maxConnections = numCores * 2;

		console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

		if (numConnections > maxConnections) {
			console.log(
				`Number of connections: ${numConnections} is overloading`
			);
		}
	}, _SECONDS); // monitor every 5 seconds
};

export default {
	countConnect,
	checkOverload,
};
