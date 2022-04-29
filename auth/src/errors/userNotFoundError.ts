import { StatusCodes } from 'http-status-codes';
import { CustomError } from './customError';

export class UserNotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;

  constructor() {
    super('User not found');
  }

  serialize() {
    return [{ message: this.message }];
  }
}
