import { Subject } from './subject';

export interface TicketUpdatedEvent {
  subject: Subject.TicketUpdated;
  data: {
    id: string;
    titile: string;
    price: number;
    userId: string;
  };
}
