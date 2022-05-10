import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ConfigLoader } from './configLoader';

jest.mock('../shared/natsClient');

let mongo: MongoMemoryServer;

ConfigLoader.loadConfig();

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();

  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();

  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
