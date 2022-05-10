import { EventBusPublisher, PaymentCreatedEvent, Subject } from '@cieslar-ticketing-common/common';

export class PaymentCreatedPublisher extends EventBusPublisher<PaymentCreatedEvent> {
  readonly subject: Subject.PaymentCreated = Subject.PaymentCreated;
}
