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

export default app;
