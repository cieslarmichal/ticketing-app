import { EventBusPublisher, OrderCreatedEvent, Subject } from '@cieslar-ticketing-common/common';

export class OrderCreatedPublisher extends EventBusPublisher<OrderCreatedEvent> {
  readonly subject: Subject.OrderCreated = Subject.OrderCreated;
}
