import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).send({ errors: err.serialize() });
    return;
  }

  console.log(err);

  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send({ errors: [{ message: err.message }] });
};
