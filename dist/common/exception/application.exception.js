"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerErrorException = exports.UnprocessableEntityException = exports.TooManyRequestException = exports.ConflictException = exports.ForbiddenException = exports.UnauthorizedException = exports.NotFoundException = exports.BadRequestException = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    message;
    status;
    cause;
    constructor(message, status, cause) {
        super();
        this.message = message;
        this.status = status;
        this.cause = cause;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationException = ApplicationException;
class BadRequestException extends ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 400, { cause });
    }
}
exports.BadRequestException = BadRequestException;
class NotFoundException extends ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 404, { cause });
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 401, { cause });
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 403, { cause });
    }
}
exports.ForbiddenException = ForbiddenException;
class ConflictException extends ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 409, { cause });
    }
}
exports.ConflictException = ConflictException;
class TooManyRequestException extends ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 429, { cause });
    }
}
exports.TooManyRequestException = TooManyRequestException;
class UnprocessableEntityException extends ApplicationException {
    constructor(message = "Unprocessable Entity", cause) {
        super(message, 422, cause);
    }
}
exports.UnprocessableEntityException = UnprocessableEntityException;
class InternalServerErrorException extends ApplicationException {
    constructor(message = "Internal Server Error", cause) {
        super(message, 500, cause);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
