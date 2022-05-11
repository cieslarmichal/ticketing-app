import express, { Request, Response } from 'express';
import {
  authMiddleware,
  currentUserMiddleware,
  OrderStatus,
  validateRequestMiddleware,
} from '@cieslar-ticketing-common/common';
import { body } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { Order, Ticket } from '../models';
import mongoose from 'mongoose';
import { OrderAlreadyExistsError, TicketNotFoundError } from '../errors';
import { OrderCreatedPublisher } from '../events';
import { natsClient } from '../shared';

const ORDER_EXPIRATION_TIME_IN_SECONDS = 60;

const router = express.Router();

router.post(
  '/api/orders',
  [
    currentUserMiddleware,
    authMiddleware,
    body('ticketId').notEmpty().withMessage('Ticket id not provided'),
    validateRequestMiddleware,
  ],
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    if (!mongoose.isValidObjectId(ticketId)) {
      throw new TicketNotFoundError();
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new TicketNotFoundError();
    }

    const existingOrder = await Order.findOne({
      ticket,
      status: {
        $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete],
      },
    });

    if (existingOrder) {
      throw new OrderAlreadyExistsError();
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + ORDER_EXPIRATION_TIME_IN_SECONDS);

    const order = Order.build({ userId: req.currentUser!.id, status: OrderStatus.Created, expiresAt, ticket });

    await order.save();

    await new OrderCreatedPublisher(natsClient.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(StatusCodes.CREATED).send(order);
  },
);

export { router as createOrderRouter };
