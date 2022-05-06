import express, { Request, Response } from 'express';
import { authMiddleware, currentUserMiddleware } from '@cieslar-ticketing-common/common';
import { StatusCodes } from 'http-status-codes';
import { Order } from '../models';
import { OrderNotFoundError, UserHasNoOwnershipOverOrder } from '../errors';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/api/orders/:id', [currentUserMiddleware, authMiddleware], async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new OrderNotFoundError();
  }

  const order = await Order.findById(id).populate('ticket');

  if (!order) {
    throw new OrderNotFoundError();
  }

  if (req.currentUser?.id !== order.userId) {
    throw new UserHasNoOwnershipOverOrder();
  }

  res.status(StatusCodes.OK).send(order);
});

export { router as getOrderRouter };
