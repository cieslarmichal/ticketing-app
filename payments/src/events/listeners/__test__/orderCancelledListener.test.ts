import { OrderCancelledEvent, OrderStatus } from '@cieslar-ticketing-common/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderNotFoundError } from '../../../errors';
import { Order, OrderDocument } from '../../../models';
import { natsClient } from '../../../shared';
import { OrderCancelledListener } from '../orderCancelledListener';

jest.mock('../../../shared/stripeClient');

describe(`Receiving order cancelled event message`, () => {
  let listener: OrderCancelledListener;
  let order: OrderDocument;
  let data: OrderCancelledEvent['data'];
  let message: Message;

  beforeEach(async () => {
    listener = new OrderCancelledListener(natsClient.client);

    order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      price: 10,
      userId: 'userId',
      version: 0,
    });

    await order.save();

    data = {
      id: order.id,
      version: order.version + 1,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
      },
    };

    // @ts-ignore
    message = {
      ack: jest.fn(),
    };
  });

  it('sets order status as cancelled and acks the message', async () => {
    await listener.onMessage(data, message);

    const updatedOrder = await Order.findById(data.id);

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

    expect(message.ack).toHaveBeenCalled();
  });

  it('throws not found error when order from event message is not found', async () => {
    expect.assertions(2);

    data.id = new mongoose.Types.ObjectId().toHexString();

    try {
      await listener.onMessage(data, message);
    } catch (error) {
      expect(error).toBeInstanceOf(OrderNotFoundError);
    }

    expect(message.ack).not.toHaveBeenCalled();
  });
});
