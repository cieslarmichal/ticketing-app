import express, { Request, Response } from 'express';
import { authMiddleware, currentUserMiddleware } from '@cieslar-ticketing-common/common';
import { validateRequestMiddleware } from '@cieslar-ticketing-common/common';
import { body } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.post(
  '/api/tickets',
  [
    currentUserMiddleware,
    authMiddleware,
    body('title').notEmpty().withMessage('Title not provided'),
    body('price').isFloat({ gt: 0 }).notEmpty().withMessage('Price must be greater than zero'),
    validateRequestMiddleware,
  ],
  (req: Request, res: Response) => {
    res.status(StatusCodes.CREATED).send();
  },
);

export { router as createTicketRouter };
