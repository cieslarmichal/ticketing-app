import { StatusCodes } from 'http-status-codes';
import { CustomError } from '@cieslar-ticketing-common/common';

export class UserHasNoOwnershipOverOrder extends CustomError {
  statusCode = StatusCodes.FORBIDDEN;

  constructor() {
    super('User is not an owner of an order');
  }

  serialize() {
    return [{ message: this.message }];
  }
}
