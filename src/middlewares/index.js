import logger from "../loggers/discord.log.js";

export const pushLogToDiscord = (req, res, next) => {
	try {
		logger.sendCodeMessage({
			title: `[${req.method}] ${req.originalUrl}`,
			code: req.method === "GET" ? req.query : req.body,
			message: `Request from ip: ${req.ip} with host: ${req.get("host")}`
		})
		next();
	} catch (error) {
		next(error);
	}
}