import mongoose from 'mongoose';
import { App } from './app';
import { natsClient } from './shared';
import { Server } from './server';
import { OrderCancelledListener, OrderCreatedListener } from './events';

async function main() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL is not defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID is not defined');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID is not defined');
  }

  try {
    await natsClient.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);

    natsClient.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    process.on('SIGINT', () => natsClient.client.close());
    process.on('SIGTERM', () => natsClient.client.close());

    new OrderCreatedListener(natsClient.client).listen();
    new OrderCancelledListener(natsClient.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to ${process.env.MONGO_URI}`);
  } catch (error) {
    console.log(error);
  }

  const app = new App();

  const server = new Server(app.instance);

  server.listen();
}

main();
