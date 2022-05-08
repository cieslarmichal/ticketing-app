import { TicketCreatedEvent } from '@cieslar-ticketing-common/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models';
import { natsClient } from '../../../shared';
import { TicketCreatedListener } from '../ticketCreatedListener';

describe(`Receiving ticket created event message`, () => {
  let listener: TicketCreatedListener;
  let data: TicketCreatedEvent['data'];
  let message: Message;

  beforeAll(async () => {
    listener = new TicketCreatedListener(natsClient.client);

    data = {
      version: 0,
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 10,
      userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // @ts-ignore
    message = {
      ack: jest.fn(),
    };
  });

  it('creates and saves a ticket and acks the event message', async () => {
    await listener.onMessage(data, message);

    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);

    expect(message.ack).toHaveBeenCalled();
  });
});
