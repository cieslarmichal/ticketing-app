import { EventBusListener, Subject, TicketUpdatedEvent } from '@cieslar-ticketing-common/common';
import { Message } from 'node-nats-streaming';
import { TicketNotFoundError } from '../../errors';
import { Ticket } from '../../models';
import { queueGroupName } from './queueGroupName';

export class TicketUpdatedListener extends EventBusListener<TicketUpdatedEvent> {
  readonly subject: Subject.TicketUpdated = Subject.TicketUpdated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], message: Message) {
    const { id, title, price } = data;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new TicketNotFoundError();
    }

    ticket.set({ title, price });
    await ticket.save();

    message.ack();
  }
}
