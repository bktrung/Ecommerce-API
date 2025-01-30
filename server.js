const app = require("./src/app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
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
