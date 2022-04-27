import express from "express";
import {
  currentUserRouter,
  signInRouter,
  signOutRouter,
  signUpRouter,
} from "./routes";
import { errorMiddleware } from "./middlewares";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(signUpRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(currentUserRouter);

app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
