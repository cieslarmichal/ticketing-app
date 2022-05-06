import { StatusCodes } from 'http-status-codes';
import { CustomError } from '@cieslar-ticketing-common/common';

export class OrderNotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;

  constructor() {
    super('Order not found');
  }

  serialize() {
    return [{ message: this.message }];
  }
}
