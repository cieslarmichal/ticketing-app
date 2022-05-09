import { Subject } from './subject';

export interface ExpirationCompleteEvent {
  subject: Subject.ExpirationComplete;
  data: {
    orderId: string;
  };
}
