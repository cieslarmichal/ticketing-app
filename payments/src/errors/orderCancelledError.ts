import { StatusCodes } from 'http-status-codes';
import { CustomError } from '@cieslar-ticketing-common/common';

export class OrderCancelledError extends CustomError {
  statusCode = StatusCodes.UNPROCESSABLE_ENTITY;

  constructor() {
    super('Cannot pay for cancelled order');
  }

  serialize() {
    return [{ message: this.message }];
  }
}
