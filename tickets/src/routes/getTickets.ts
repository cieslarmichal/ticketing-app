import express, { Request, Response } from 'express';
import { authMiddleware, currentUserMiddleware } from '@cieslar-ticketing-common/common';
import { StatusCodes } from 'http-status-codes';
import { Ticket } from '../models';

const router = express.Router();

router.get('/api/tickets', [currentUserMiddleware, authMiddleware], async (req: Request, res: Response) => {
  const tickets = await Ticket.find({ orderId: undefined });

  res.status(StatusCodes.OK).send(tickets);
});

export { router as getTicketsRouter };
