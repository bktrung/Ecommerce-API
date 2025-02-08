import { StatusCodes, ReasonPhrases } from "../utils/httpStatusCode.js";

class SuccessResponse {
	static send({
		res,
		message,
		statusCode = StatusCodes.OK,
		reasonStatusCode = ReasonPhrases.OK,
		metadata = {},
	}) {
		return res.status(statusCode).json({
			message: message || reasonStatusCode,
			status: statusCode,
			metadata,
		});
	}
}

export class OK {
	static send({ res, message, metadata }) {
		return SuccessResponse.send({
			res,
			message,
			statusCode: StatusCodes.OK,
			reasonStatusCode: ReasonPhrases.OK,
			metadata,
		});
	}
}

export class CREATED {
	static send({ res, message, metadata }) {
		return SuccessResponse.send({
			res,
			message,
			statusCode: StatusCodes.CREATED,
			reasonStatusCode: ReasonPhrases.CREATED,
			metadata,
		});
	}
}

// class SuccessResponse {
// 	constructor({
// 		message,
// 		statusCode = StatusCodes.OK,
// 		reasonStatusCode = ReasonPhrases.OK,
// 		metadata = {},
// 	}) {
// 		this.message = message || reasonStatusCode;
// 		this.status = statusCode;
// 		this.metadata = metadata;
// 	}

// 	send(res, headers = {}) {
// 		return res.status(this.status).json(this);
// 	}
// }

// export class OK extends SuccessResponse {
// 	constructor({ message, metadata }) {
// 		super({
// 			message,
// 			statusCode: StatusCodes.OK,
// 			reasonStatusCode: ReasonPhrases.OK,
// 			metadata,
// 		});
// 	}
// }

// export class CREATED extends SuccessResponse {
// 	constructor({ message, metadata }) {
// 		super({
// 			message,
// 			statusCode: StatusCodes.CREATED,
// 			reasonStatusCode: ReasonPhrases.CREATED,
// 			metadata,
// 		});
// 	}
// }