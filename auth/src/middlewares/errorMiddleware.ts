import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DatabaseConnectionError, RequestValidationError } from '../errors';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof RequestValidationError) {
    const formattedErrors = err.reasons.map((error) => {
      return { message: error.msg, field: error.param };
    });
    res.status(StatusCodes.BAD_REQUEST).send({ errors: formattedErrors });
    return;
  } else if (err instanceof DatabaseConnectionError) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ errors: [{ message: err.message }] });
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ errors: [{ message: err.message }] });
};
