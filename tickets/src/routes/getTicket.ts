import express, { Request, Response } from 'express';
import { authMiddleware, currentUserMiddleware } from '@cieslar-ticketing-common/common';
import { StatusCodes } from 'http-status-codes';
import { Ticket } from '../models';
import { TicketNotFoundError } from '../errors';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/api/tickets/:id', [currentUserMiddleware, authMiddleware], async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new TicketNotFoundError();
  }

  const ticket = await Ticket.findById(id);

  if (!ticket) {
    throw new TicketNotFoundError();
  }

  res.status(StatusCodes.OK).send(ticket);
});

export { router as getTicketRouter };
