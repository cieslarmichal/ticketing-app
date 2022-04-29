import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { EmailInUseError, RequestValidationError } from '../errors';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be between 4 and 20 characters'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new EmailInUseError();
    }

    const user = User.build({ email, password });

    await user.save();

    const token = jwt.sign({ id: user.id, email: user.email }, 'xxxx');

    req.session = { token };

    res.status(StatusCodes.CREATED).send(user);
  },
);

export { router as signUpRouter };
