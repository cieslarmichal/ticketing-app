import { ExpirationCompleteEvent, OrderStatus } from '@cieslar-ticketing-common/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order, OrderDocument, Ticket, TicketDocument } from '../../../models';
import { natsClient } from '../../../shared';
import { ExpirationCompleteListener } from '../expirationCompleteListener';

describe(`Receiving expiration complete event message`, () => {
  let listener: ExpirationCompleteListener;
  let ticket: TicketDocument;
  let order: OrderDocument;
  let data: ExpirationCompleteEvent['data'];
  let message: Message;

  beforeEach(async () => {
    listener = new ExpirationCompleteListener(natsClient.client);

    ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 10,
    });
    await ticket.save();

    order = Order.build({
      status: OrderStatus.Created,
      userId: 'userId',
      expiresAt: new Date(),
      ticket,
    });
    await order.save();

    data = {
      orderId: order.id,
    };

    // @ts-ignore
    message = {
      ack: jest.fn(),
    };
  });

  it('updates order status to cancelled and acks the event message', async () => {
    await listener.onMessage(data, message);

    const order = await Order.findById(data.orderId);

    expect(order).toBeDefined();
    expect(order!.status).toEqual(OrderStatus.Cancelled);

    expect(message.ack).toHaveBeenCalled();

    const natsClientPublishMock = natsClient.client.publish as jest.Mock;

    const actualUpdatedOrderData = JSON.parse(natsClientPublishMock.mock.calls[0][1]);

    expect(actualUpdatedOrderData.id).toEqual(data.orderId);
  });

  it('does not ack the event if order does not exist', async () => {
    expect.assertions(2);

    data.orderId = new mongoose.Types.ObjectId().toHexString();

    try {
      await listener.onMessage(data, message);
    } catch (error) {
      expect(error).toBeTruthy();
    }

    expect(message.ack).not.toHaveBeenCalled();
  });
});
