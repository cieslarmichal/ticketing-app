import { StatusCodes } from 'http-status-codes';
import { CustomError } from './customError';

export class RouteNotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;

  constructor() {
    super('Route not found');
  }

  serialize() {
    return [{ message: 'Route not found' }];
  }
}
