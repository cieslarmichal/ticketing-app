import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { UserNotFoundError } from '../errors';
import { User } from '../models';
import { validateRequestMiddleware } from '@cieslar-ticketing-common/common';
import { HashService } from '../services';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Password not provided'),
    validateRequestMiddleware,
  ],
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new UserNotFoundError();
    }

    const passwordsMatch = await HashService.compare(password, existingUser.password);

    if (!passwordsMatch) {
      throw new UserNotFoundError();
    }

    const jwtSecret = process.env.JWT_SECRET as string;

    const token = jwt.sign({ id: existingUser.id, email: existingUser.email }, jwtSecret);

    req.session = { token };

    res.status(StatusCodes.OK).send(existingUser);
  },
);

export { router as signInRouter };
