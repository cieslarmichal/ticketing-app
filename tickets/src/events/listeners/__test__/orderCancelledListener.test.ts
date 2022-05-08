import { OrderCancelledEvent } from '@cieslar-ticketing-common/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketNotFoundError } from '../../../errors';
import { Ticket, TicketDocument } from '../../../models';
import { natsClient } from '../../../shared';
import { OrderCancelledListener } from '../orderCancelledListener';

describe(`Receiving order cancelled event message`, () => {
  let listener: OrderCancelledListener;
  let ticket: TicketDocument;
  let data: OrderCancelledEvent['data'];
  let message: Message;

  beforeEach(async () => {
    listener = new OrderCancelledListener(natsClient.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();

    ticket = Ticket.build({
      title: 'concert',
      price: 10,
      userId: 'userId',
    });

    ticket.orderId = orderId;

    await ticket.save();

    data = {
      id: orderId,
      version: 0,
      ticket: {
        id: ticket.id,
      },
    };

    // @ts-ignore
    message = {
      ack: jest.fn(),
    };
  });

  it('clears orderId from corresponding ticket document and acks the message', async () => {
    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).not.toBeDefined();

    expect(message.ack).toHaveBeenCalled();
  });

  it('publishes a ticket updated event', async () => {
    await listener.onMessage(data, message);

    expect(natsClient.client.publish).toHaveBeenCalled();

    const natsClientPublishMock = natsClient.client.publish as jest.Mock;

    const actualUpdatedTicketData = JSON.parse(natsClientPublishMock.mock.calls[0][1]);

    expect(actualUpdatedTicketData.orderId).not.toBeDefined();
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
