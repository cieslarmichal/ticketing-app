import { StatusCodes } from 'http-status-codes';
import { CustomError } from '@cieslar-ticketing-common/common';

export class OrderAlreadyExistsError extends CustomError {
  statusCode = StatusCodes.UNPROCESSABLE_ENTITY;

  constructor() {
    super('Order already exists');
  }

  serialize() {
    return [{ message: this.message }];
  }
}
