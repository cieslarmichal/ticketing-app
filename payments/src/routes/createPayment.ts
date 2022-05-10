import express, { Request, Response } from 'express';
import {
  authMiddleware,
  currentUserMiddleware,
  OrderStatus,
  validateRequestMiddleware,
} from '@cieslar-ticketing-common/common';
import { body } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { Order } from '../models';
import mongoose from 'mongoose';
import { OrderCancelledError, OrderNotFoundError, UserHasNoOwnershipOverOrder } from '../errors';

const router = express.Router();

router.post(
  '/api/payments',
  [
    currentUserMiddleware,
    authMiddleware,
    body('token').notEmpty().withMessage('Token not provided'),
    body('orderId').notEmpty().withMessage('Order id not provided'),
    validateRequestMiddleware,
  ],
  async (req: Request, res: Response) => {
    const { orderId } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
      throw new OrderNotFoundError();
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new OrderNotFoundError();
    }

    if (req.currentUser!.id !== order.userId) {
      throw new UserHasNoOwnershipOverOrder();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new OrderCancelledError();
    }

    res.status(StatusCodes.CREATED).send(order);
  },
);

export { router as createPaymentRouter };
