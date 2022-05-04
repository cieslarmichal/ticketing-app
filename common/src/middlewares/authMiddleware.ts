import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.currentUser) {
    throw new UnauthorizedError();
  }

  next();
};
