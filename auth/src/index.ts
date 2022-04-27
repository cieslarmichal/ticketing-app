import express from 'express';
require('express-async-errors');
import mongoose from 'mongoose';
import { currentUserRouter, signInRouter, signOutRouter, signUpRouter } from './routes';
import { errorMiddleware } from './middlewares';
import { RouteNotFoundError } from './errors';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(signUpRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(currentUserRouter);

app.all('*', () => {
  throw new RouteNotFoundError();
});

app.use(errorMiddleware);

const startApp = async () => {
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
    console.log('Connected to mongodb');
  } catch (error) {
    console.log(error);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

startApp();
