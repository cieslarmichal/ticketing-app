import mongoose from 'mongoose';
import { App } from './app';
import { Server } from './server';

async function main() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    await mongoose.connect('mongodb://tickets-mongo-srv:27017/auth');
    console.log('Connected to mongodb');
  } catch (error) {
    console.log(error);
  }

  const app = new App();

  const server = new Server(app.instance);

  server.listen();
}

main();
