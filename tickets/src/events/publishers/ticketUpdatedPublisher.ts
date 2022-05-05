import { EventBusPublisher, Subject, TicketUpdatedEvent } from '@cieslar-ticketing-common/common';

export class TicketUpdatedPublisher extends EventBusPublisher<TicketUpdatedEvent> {
  readonly subject: Subject.TicketUpdated = Subject.TicketUpdated;
}
