import { Subject } from './subject';

export interface Event {
  subject: Subject;
  data: any;
}
