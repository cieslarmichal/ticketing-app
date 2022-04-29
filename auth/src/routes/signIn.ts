import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequestMiddleware } from '../middlewares';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Password not provided'),
    validateRequestMiddleware,
  ],
  (req: Request, res: Response) => {
    res.send({});
  },
);

export { router as signInRouter };
