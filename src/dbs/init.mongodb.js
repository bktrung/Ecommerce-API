import { set, connect } from "mongoose";
import checkConnect from "../helpers/check.connect.js";
const { countConnect } = checkConnect;
import configMongodb from "../configs/config.mongodb.js";
const {
	db: { host, port, name },
} = configMongodb;
const connectString = `mongodb://${host}:${port}/${name}`;

/**
 * @class Database
 * @description Manages database connections using the Singleton pattern
 * @example
 * const db = Database.getInstance();
 */
class Database {
	constructor() {
		this._connect();
	}

	_connect(_type = "mongodb") {
		if (process.env.NODE_ENV === "dev") {
			set("debug", true);
			set("debug", { color: true });
		}

		connect(connectString, {
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
export default db;
