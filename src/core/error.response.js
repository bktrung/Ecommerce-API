import { StatusCodes, ReasonPhrases } from "../utils/httpStatusCode.js";

class ErrorResponse extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;
	}
}

export class ConflictRequestError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.CONFLICT,
		statusCode = StatusCodes.CONFLICT
	) {
		super(message, statusCode);
	}
}

export class BadRequestError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.BAD_REQUEST,
		statusCode = StatusCodes.BAD_REQUEST
	) {
		super(message, statusCode);
	}
}

export class AuthFailureError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.UNAUTHORIZED,
		statusCode = StatusCodes.UNAUTHORIZED
	) {
		super(message, statusCode);
	}
}

export class NotFoundError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.NOT_FOUND,
		statusCode = StatusCodes.NOT_FOUND
	) {
		super(message, statusCode);
	}
}

export class ForbiddenError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.FORBIDDEN,
		statusCode = StatusCodes.FORBIDDEN
	) {
		super(message, statusCode);
	}
}
