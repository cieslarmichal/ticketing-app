import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { EmailInUseError } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { validateRequestMiddleware } from '../middlewares';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be between 4 and 20 characters'),
    validateRequestMiddleware,
  ],
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new EmailInUseError();
    }

    const user = User.build({ email, password });

    await user.save();

    const jwtSecret = process.env.JWT_SECRET as string;

    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret);

    req.session = { token };

    res.status(StatusCodes.CREATED).send(user);
  },
);

export { router as signUpRouter };
