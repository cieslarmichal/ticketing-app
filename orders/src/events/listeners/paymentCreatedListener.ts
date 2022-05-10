import { EventBusListener, Subject, PaymentCreatedEvent, OrderStatus } from '@cieslar-ticketing-common/common';
import { Message } from 'node-nats-streaming';
import { OrderNotFoundError } from '../../errors';
import { Order } from '../../models';
import { queueGroupName } from './queueGroupName';

export class PaymentCreatedListener extends EventBusListener<PaymentCreatedEvent> {
  readonly subject: Subject.PaymentCreated = Subject.PaymentCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], message: Message) {
    const { orderId } = data;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new OrderNotFoundError();
    }

    order.status = OrderStatus.Complete;

    await order.save();

    message.ack();
  }
}
