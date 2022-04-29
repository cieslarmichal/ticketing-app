import { StatusCodes } from 'http-status-codes';
import { CustomError } from './customError';

export class UnauthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor() {
    super('User is not authorized');
  }

  serialize() {
    return [{ message: this.message }];
  }
}
