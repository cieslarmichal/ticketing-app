import { StatusCodes } from 'http-status-codes';
import { CustomError } from '@cieslar-ticketing-common/common';

export class TicketNotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;

  constructor() {
    super('Ticket not found');
  }

  serialize() {
    return [{ message: this.message }];
  }
}
