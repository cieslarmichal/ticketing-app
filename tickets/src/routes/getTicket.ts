import express, { Request, Response } from 'express';
import { authMiddleware, currentUserMiddleware } from '@cieslar-ticketing-common/common';
import { StatusCodes } from 'http-status-codes';
import { Ticket } from '../models';
import { TicketNotFoundError } from '../errors';

const router = express.Router();

router.get('/api/tickets/:id', [currentUserMiddleware, authMiddleware], async (req: Request, res: Response) => {
  const { id } = req.params;

  let ticket;

  try {
    ticket = await Ticket.findById(id);
  } catch (error) {
    throw new TicketNotFoundError();
  }

  res.status(StatusCodes.OK).send(ticket);
});

export { router as getTicketRouter };
