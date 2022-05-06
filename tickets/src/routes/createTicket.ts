import express, { Request, Response } from 'express';
import { authMiddleware, currentUserMiddleware } from '@cieslar-ticketing-common/common';
import { validateRequestMiddleware } from '@cieslar-ticketing-common/common';
import { body } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { Ticket } from '../models';
import { TicketCreatedPublisher } from '../events';
import { natsClient } from '../shared';

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
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });

    await ticket.save();

    await new TicketCreatedPublisher(natsClient.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(StatusCodes.CREATED).send(ticket);
  },
);

export { router as createTicketRouter };
