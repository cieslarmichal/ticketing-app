import express, { Request, Response } from 'express';
import {
  authMiddleware,
  currentUserMiddleware,
  OrderStatus,
  validateRequestMiddleware,
} from '@cieslar-ticketing-common/common';
import { StatusCodes } from 'http-status-codes';
import { Order } from '../models';
import { OrderNotFoundError, UserHasNoOwnershipOverOrder } from '../errors';
import mongoose from 'mongoose';
import { body } from 'express-validator';
// import { OrderUpdatedPublisher } from '../events';
// import { natsClient } from '../shared';

const router = express.Router();

router.patch(
  '/api/orders/:id',
  [
    currentUserMiddleware,
    authMiddleware,
    body('status')
      .custom((input) => Object.values(OrderStatus).includes(input))
      .withMessage('Status not valid'),
    validateRequestMiddleware,
  ],
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new OrderNotFoundError();
    }

    const order = await Order.findById(id);

    if (!order) {
      throw new OrderNotFoundError();
    }

    if (req.currentUser?.id !== order.userId) {
      throw new UserHasNoOwnershipOverOrder();
    }

    const { status } = req.body;

    order.status = status;
    await order.save();

    // await new OrderUpdatedPublisher(natsClient.client).publish({
    //   id: order.id,
    //   title: order.title,
    //   price: order.price,
    //   userId: order.userId,
    // });

    // const updatedOrder = await Order.findById(id);

    res.status(StatusCodes.OK).send(order);
  },
);

export { router as updateOrderRouter };
