import { OrderCreatedEvent, OrderStatus } from '@cieslar-ticketing-common/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketNotFoundError } from '../../../errors';
import { Ticket, TicketDocument } from '../../../models';
import { natsClient } from '../../../shared';
import { OrderCreatedListener } from '../orderCreatedListener';

describe(`Receiving order created event message`, () => {
  let listener: OrderCreatedListener;
  let ticket: TicketDocument;
  let data: OrderCreatedEvent['data'];
  let message: Message;

  beforeEach(async () => {
    listener = new OrderCreatedListener(natsClient.client);

    ticket = Ticket.build({
      title: 'concert',
      price: 10,
      userId: 'userId',
    });
    await ticket.save();

    data = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      status: OrderStatus.Created,
      userId: ticket.userId,
      expiresAt: 'date',
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    };

    // @ts-ignore
    message = {
      ack: jest.fn(),
    };
  });

  it('assigns orderId to corresponding ticket document and acks the message', async () => {
    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).toEqual(data.id);

    expect(message.ack).toHaveBeenCalled();
  });

  it('publishes a ticket updated event', async () => {
    await listener.onMessage(data, message);

    expect(natsClient.client.publish).toHaveBeenCalled();

    const natsClientPublishMock = natsClient.client.publish as jest.Mock;

    const actualUpdatedTicketData = JSON.parse(natsClientPublishMock.mock.calls[0][1]);

    expect(actualUpdatedTicketData.orderId).toEqual(data.id);
  });

  it('throws not found error when ticketId from event message is not found', async () => {
    expect.assertions(2);

    data.ticket.id = new mongoose.Types.ObjectId().toHexString();

    try {
      await listener.onMessage(data, message);
    } catch (error) {
      expect(error).toBeInstanceOf(TicketNotFoundError);
    }

    expect(message.ack).not.toHaveBeenCalled();
  });
});
