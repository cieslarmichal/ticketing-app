import { EventBusListener, Subject, OrderCreatedEvent } from '@cieslar-ticketing-common/common';
import { Message } from 'node-nats-streaming';
import { TicketNotFoundError } from '../../errors';
import { Ticket } from '../../models';
import { TicketUpdatedPublisher } from '../publishers';
import { queueGroupName } from './queueGroupName';

export class OrderCreatedListener extends EventBusListener<OrderCreatedEvent> {
  readonly subject: Subject.OrderCreated = Subject.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], message: Message) {
    const {
      id: orderId,
      ticket: { id: ticketId },
    } = data;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new TicketNotFoundError();
    }

    ticket.orderId = orderId;

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    message.ack();
  }
}
