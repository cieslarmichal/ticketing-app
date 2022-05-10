import { EventBusListener, Subject, ExpirationCompleteEvent, OrderStatus } from '@cieslar-ticketing-common/common';
import { Message } from 'node-nats-streaming';
import { OrderNotFoundError } from '../../errors';
import { Order } from '../../models';
import { OrderCancelledPublisher } from '../publishers';
import { queueGroupName } from './queueGroupName';

export class ExpirationCompleteListener extends EventBusListener<ExpirationCompleteEvent> {
  readonly subject: Subject.ExpirationComplete = Subject.ExpirationComplete;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], message: Message) {
    const { orderId } = data;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new OrderNotFoundError();
    }

    if (order.status === OrderStatus.Complete) {
      message.ack();
      return;
    }

    order.status = OrderStatus.Cancelled;

    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    message.ack();
  }
}
