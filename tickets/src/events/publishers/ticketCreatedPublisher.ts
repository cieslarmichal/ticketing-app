import { EventBusPublisher, Subject, TicketCreatedEvent } from '@cieslar-ticketing-common/common';

export class TicketCreatedPublisher extends EventBusPublisher<TicketCreatedEvent> {
  readonly subject: Subject.TicketCreated = Subject.TicketCreated;
}
