import { EventBusListener, Subject, OrderCancelledEvent, OrderStatus } from '@cieslar-ticketing-common/common';
import { Message } from 'node-nats-streaming';
import { OrderNotFoundError } from '../../errors';
import { Order } from '../../models';
import { queueGroupName } from './queueGroupName';

export class OrderCancelledListener extends EventBusListener<OrderCancelledEvent> {
  readonly subject: Subject.OrderCancelled = Subject.OrderCancelled;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], message: Message) {
    const { id, version } = data;

    const order = await Order.findOne({
      _id: id,
      version: version - 1,
    });

    if (!order) {
      throw new OrderNotFoundError();
    }

    order.status = OrderStatus.Cancelled;

    await order.save();

    message.ack();
  }
}
