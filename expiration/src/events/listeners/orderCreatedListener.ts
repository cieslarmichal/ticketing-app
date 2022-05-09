import { EventBusListener, Subject, OrderCreatedEvent } from '@cieslar-ticketing-common/common';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from 'src/queues';
import { queueGroupName } from './queueGroupName';

export class OrderCreatedListener extends EventBusListener<OrderCreatedEvent> {
  readonly subject: Subject.OrderCreated = Subject.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], message: Message) {
    const { id: orderId } = data;

    await expirationQueue.add({ orderId });

    message.ack();
  }
}
