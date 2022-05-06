import { EventBusPublisher, OrderCancelledEvent, Subject } from '@cieslar-ticketing-common/common';

export class OrderCancelledPublisher extends EventBusPublisher<OrderCancelledEvent> {
  readonly subject: Subject.OrderCancelled = Subject.OrderCancelled;
}
