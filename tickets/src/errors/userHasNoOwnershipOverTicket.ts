import { StatusCodes } from 'http-status-codes';
import { CustomError } from '@cieslar-ticketing-common/common';

export class UserHasNoOwnershipOverTicket extends CustomError {
  statusCode = StatusCodes.FORBIDDEN;

  constructor() {
    super('User is not an owner of a ticket');
  }

  serialize() {
    return [{ message: this.message }];
  }
}
