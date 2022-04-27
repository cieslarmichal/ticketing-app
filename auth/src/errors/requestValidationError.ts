import { ValidationError } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from './customError';

export class RequestValidationError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  constructor(public reasons: ValidationError[]) {
    super('Validation error');
  }

  serialize() {
    return this.reasons.map((error) => {
      return { message: error.msg, field: error.param };
    });
  }
}
