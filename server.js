import app from "./src/app.js";
import configMongodb from "./src/configs/config.mongodb.js";
const {
	app: { port }
} = configMongodb;

const server = app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
	server.close(() => {
		console.log("Server is closed");
		process.exit(0);
	});
});

process.on("SIGTERM", () => {
	server.close(() => {
		console.log("Server is closed");
		process.exit(0);
	});
});
