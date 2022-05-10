import { OrderCreatedEvent, OrderStatus } from '@cieslar-ticketing-common/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models';
import { natsClient } from '../../../shared';
import { OrderCreatedListener } from '../orderCreatedListener';

describe(`Receiving order created event message`, () => {
  let listener: OrderCreatedListener;
  let data: OrderCreatedEvent['data'];
  let message: Message;

  beforeEach(async () => {
    listener = new OrderCreatedListener(natsClient.client);

    data = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId: 'userId',
      expiresAt: 'date',
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 5,
      },
    };

    // @ts-ignore
    message = {
      ack: jest.fn(),
    };
  });

  it('saves order and acks the message', async () => {
    await listener.onMessage(data, message);

    const order = await Order.findById(data.id);

    expect(order).toBeDefined();
    expect(order!.id).toEqual(data.id);
    expect(order!.price).toEqual(data.ticket.price);

    expect(message.ack).toHaveBeenCalled();
  });
});
