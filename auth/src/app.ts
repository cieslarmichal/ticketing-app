import express from 'express';
require('express-async-errors');
import cookieSession from 'cookie-session';
import helmet from 'helmet';
import { currentUserRouter, signInRouter, signOutRouter, signUpRouter } from './routes';
import { errorMiddleware } from './middlewares';
import { RouteNotFoundError } from './errors';

const app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(
  cookieSession({
    signed: false,
    secure: true,
  }),
);

app.use(signUpRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(currentUserRouter);

app.all('*', () => {
  throw new RouteNotFoundError();
});

app.use(errorMiddleware);

export { app };
