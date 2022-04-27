import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DatabaseConnectionError, RequestValidationError } from '../errors';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof RequestValidationError) {
    res.status(err.statusCode).send({ errors: err.serialize() });
    return;
  } else if (err instanceof DatabaseConnectionError) {
    res.status(err.statusCode).send({ errors: err.serialize() });
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ errors: [{ message: err.message }] });
};
