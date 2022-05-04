import { StatusCodes } from 'http-status-codes';
import { CustomError } from '@cieslar-ticketing-common/common';

export class EmailInUseError extends CustomError {
  statusCode = StatusCodes.UNPROCESSABLE_ENTITY;

  constructor() {
    super('Email is already in use');
  }

  serialize() {
    return [{ message: this.message }];
  }
}
