import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log('Something went wrong', err);

  res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
};
