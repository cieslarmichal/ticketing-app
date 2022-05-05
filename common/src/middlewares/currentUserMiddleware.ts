import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.token) {
    next();
    return;
  }

  const jwtSecret = process.env.JWT_SECRET as string;

  try {
    const userPayload = jwt.verify(req.session.token, jwtSecret) as UserPayload;
    req.currentUser = userPayload;
  } catch (error) {
    console.log(error);
  }

  next();
};
