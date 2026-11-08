

export class ApplicationException extends Error {
    constructor(override message :string , public status:number ,override cause?:unknown){
        super()
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor )
    }
}

export class BadRequestException extends ApplicationException {
    constructor(message :string="BadRequest" , cause?:unknown){
        super(message, 400 ,{cause})
    }
}


export class NotFoundException extends ApplicationException {
    constructor(message :string="BadRequest" , cause?:unknown){
        super(message, 404 ,{cause})
    }
}


export class UnauthorizedException extends ApplicationException {
    constructor(message :string="BadRequest" , cause?:unknown){
        super(message, 401 ,{cause})
    }
}


export class ForbiddenException extends ApplicationException {
    constructor(message :string="BadRequest" , cause?:unknown){
        super(message, 403 ,{cause})
    }
}

export class ConflictException extends ApplicationException {
    constructor(message :string="BadRequest" , cause?:unknown){
        super(message, 409 ,{cause})
    }
}

export class TooManyRequestException extends ApplicationException {
    constructor(message :string="BadRequest" , cause?:unknown){
        super(message, 429 ,{cause})
    }
}

export class UnprocessableEntityException extends ApplicationException {
  constructor(message: string = "Unprocessable Entity", cause?: unknown) {
    super(message, 422, cause);
  }
}

export class InternalServerErrorException extends ApplicationException {
  constructor(message: string = "Internal Server Error", cause?: unknown) {
    super(message, 500, cause);
  }
}