const mongoose = require("mongoose");
const { countConnect } = require("../helpers/check.connect");
const {
	db: { host, port, name },
} = require("../configs/config.mongodb");
const connectString = `mongodb://${host}:${port}/${name}`;

class Database {
	constructor() {
		this._connect();
	}

	_connect(type = "mongodb") {
		if (process.env.NODE_ENV === "dev") {
			mongoose.set("debug", true);
			mongoose.set("debug", { color: true });
		}

		mongoose
			.connect(connectString, {
				maxPoolSize: 5,
			})
			.then(() => {
				console.log(`Connected to ${connectString}`, countConnect());
			})
			.catch((err) => {
				console.error("Database connection error:", err);
				process.exit(1); // Exit process if connection fails
			});
	}

	static getInstance() {
		if (!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}
}

const db = Database.getInstance();
module.exports = db;
