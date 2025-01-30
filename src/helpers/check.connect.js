const mongoose = require("mongoose");
const os = require("os");

const countConnect = () => {
	const numConnections = mongoose.connections.length;
	console.log(`Number of connections: ${numConnections}`);
};

const checkOverload = () => {
	const _SECONDS = 5000; // 5 seconds

	setInterval(() => {
		const numConnections = mongoose.connections.length;
		const numCores = os.cpus().length;
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

module.exports = {
	countConnect,
	checkOverload,
};
