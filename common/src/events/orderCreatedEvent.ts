import { Subject } from './subject';
import { OrderStatus } from './types';

export interface OrderCreatedEvent {
  subject: Subject.OrderCreated;
  data: {
    id: string;
    version: number;
    status: OrderStatus;
    userId: string;
    expiresAt: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}
