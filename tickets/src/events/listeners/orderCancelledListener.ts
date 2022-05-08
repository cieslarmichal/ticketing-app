import { EventBusListener, Subject, OrderCancelledEvent } from '@cieslar-ticketing-common/common';
import { Message } from 'node-nats-streaming';
import { TicketNotFoundError } from '../../errors';
import { Ticket } from '../../models';
import { TicketUpdatedPublisher } from '../publishers';
import { queueGroupName } from './queueGroupName';

export class OrderCancelledListener extends EventBusListener<OrderCancelledEvent> {
  readonly subject: Subject.OrderCancelled = Subject.OrderCancelled;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], message: Message) {
    const {
      ticket: { id: ticketId },
    } = data;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new TicketNotFoundError();
    }

    ticket.orderId = undefined;

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
