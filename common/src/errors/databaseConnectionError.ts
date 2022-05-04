import { StatusCodes } from 'http-status-codes';
import { CustomError } from './customError';

export class DatabaseConnectionError extends CustomError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  reason = 'Error connecting to database';

  constructor() {
    super('Database error');
  }

  serialize() {
    return [{ message: this.reason }];
  }
}
