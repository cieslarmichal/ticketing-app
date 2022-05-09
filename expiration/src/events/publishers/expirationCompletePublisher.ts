import { EventBusPublisher, Subject, ExpirationCompleteEvent } from '@cieslar-ticketing-common/common';

export class ExpirationCompletePublisher extends EventBusPublisher<ExpirationCompleteEvent> {
  readonly subject: Subject.ExpirationComplete = Subject.ExpirationComplete;
}
