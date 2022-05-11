import mongoose from 'mongoose';
import { App } from './app';
import { Server } from './server';

async function main() {
  console.log('Starting auth microservice');

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  try {
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
