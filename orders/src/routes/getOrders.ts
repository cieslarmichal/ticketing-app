import express, { Request, Response } from 'express';
import { authMiddleware, currentUserMiddleware } from '@cieslar-ticketing-common/common';
import { StatusCodes } from 'http-status-codes';
import { Order } from '../models';

const router = express.Router();

router.get('/api/orders', [currentUserMiddleware, authMiddleware], async (req: Request, res: Response) => {
  const userId = req.currentUser!.id;

  const orders = await Order.find({ userId }).populate('ticket');

  res.status(StatusCodes.OK).send(orders);
});

export { router as getOrdersRouter };
