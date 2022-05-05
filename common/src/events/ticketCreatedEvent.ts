import { Subject } from './subject';

export interface TicketCreatedEvent {
  subject: Subject.TicketCreated;
  data: {
    id: string;
    titile: string;
    price: number;
  };
}
