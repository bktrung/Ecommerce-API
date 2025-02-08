import 'dotenv/config';
import compression from "compression";
import express, { json, urlencoded } from "express";
import { default as helmet } from "helmet";
import morgan from "morgan";
const app = express();

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(json());
app.use(urlencoded({ extended: true }));

// init db
import "./dbs/init.mongodb.js";

// init routes
import routes from './routes/index.js';
app.use("/", routes);

// handle errors
app.use((req, res, next) => {
	const error = new Error("Not Found");
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	const statusCode = error.status || 500;
	res.status(statusCode);
	res.json({
		status: "error",
		code: statusCode,
		message: error.message || "Internal Server Error",
		// Include stack trace only in development for debugging
		...(process.env.NODE_ENV === "dev" && { stack: error.stack }),
	});
});

export default app;
