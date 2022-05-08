import { StatusCodes } from 'http-status-codes';
import { CustomError } from '@cieslar-ticketing-common/common';

export class TicketReservedError extends CustomError {
  statusCode = StatusCodes.UNPROCESSABLE_ENTITY;

  constructor() {
    super('Ticket reserved');
  }

  serialize() {
    return [{ message: this.message }];
  }
}
