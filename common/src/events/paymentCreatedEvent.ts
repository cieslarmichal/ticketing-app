import { Subject } from './subject';

export interface PaymentCreatedEvent {
  subject: Subject.PaymentCreated;
  data: {
    id: string;
    orderId: string;
    stripeId: string;
  };
}
