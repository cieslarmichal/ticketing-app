import Queue from 'bull';
import { natsClient } from '../shared';
import { ExpirationCompletePublisher } from '../events';

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  const {
    data: { orderId },
  } = job;

  new ExpirationCompletePublisher(natsClient.client).publish({ orderId });
});

export { expirationQueue };
