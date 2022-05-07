import express, { Request, Response } from 'express';
import { authMiddleware, currentUserMiddleware } from '@cieslar-ticketing-common/common';
import { validateRequestMiddleware } from '@cieslar-ticketing-common/common';
import { body } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { Ticket } from '../models';
import { TicketNotFoundError, UserHasNoOwnershipOverTicket } from '../errors';
import mongoose from 'mongoose';
import { TicketUpdatedPublisher } from '../events';
import { natsClient } from '../shared';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  [
    currentUserMiddleware,
    authMiddleware,
    body('title').optional().isString().withMessage('Title not provided'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),
    validateRequestMiddleware,
  ],
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new TicketNotFoundError();
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new TicketNotFoundError();
    }

    if (req.currentUser?.id !== ticket.userId) {
      throw new UserHasNoOwnershipOverTicket();
    }

    await Ticket.updateOne({ _id: id }, { ...req.body });

    await new TicketUpdatedPublisher(natsClient.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    const updatedTicket = await Ticket.findById(id);

    res.status(StatusCodes.OK).send(updatedTicket);
  },
);

export { router as updateTicketRouter };
