import { EventBusListener, Subject, TicketCreatedEvent } from '@cieslar-ticketing-common/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models';
import { queueGroupName } from './queueGroupName';

export class TicketCreatedListener extends EventBusListener<TicketCreatedEvent> {
  readonly subject: Subject.TicketCreated = Subject.TicketCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], message: Message) {
    const { id, title, price } = data;

    const ticket = Ticket.build({ id, title, price });
    await ticket.save();

    message.ack();
  }
}
