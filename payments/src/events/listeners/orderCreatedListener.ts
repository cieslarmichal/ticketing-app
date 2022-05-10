import { EventBusListener, Subject, OrderCreatedEvent } from '@cieslar-ticketing-common/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models';
import { queueGroupName } from './queueGroupName';

export class OrderCreatedListener extends EventBusListener<OrderCreatedEvent> {
  readonly subject: Subject.OrderCreated = Subject.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], message: Message) {
    const {
      id,
      userId,
      status,
      version,
      ticket: { price },
    } = data;

    const order = Order.build({
      id,
      price,
      status,
      userId,
      version,
    });
    await order.save();

    message.ack();
  }
}
