import { TicketUpdatedEvent } from '@cieslar-ticketing-common/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket, TicketDocument } from '../../../models';
import { natsClient } from '../../../shared';
import { TicketUpdatedListener } from '../ticketUpdatedListener';

describe(`Receiving ticket updated event message`, () => {
  let listener: TicketUpdatedListener;
  let ticket: TicketDocument;
  let data: TicketUpdatedEvent['data'];
  let message: Message;

  beforeEach(async () => {
    listener = new TicketUpdatedListener(natsClient.client);

    ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 10,
    });
    await ticket.save();

    data = {
      version: ticket.version + 1,
      id: ticket.id,
      title: ticket.id,
      price: 20,
      userId: 'userId',
    };

    // @ts-ignore
    message = {
      ack: jest.fn(),
    };
  });

  it('updates a ticket and acks the event message', async () => {
    await listener.onMessage(data, message);

    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
    expect(ticket!.version).toEqual(data.version);

    expect(message.ack).toHaveBeenCalled();
  });

  it('does not ack the event if event version is greater than current version plus one', async () => {
    expect.assertions(2);

    data.version = 5;

    try {
      await listener.onMessage(data, message);
    } catch (error) {
      expect(error).toBeTruthy();
    }

    expect(message.ack).not.toHaveBeenCalled();
  });
});
