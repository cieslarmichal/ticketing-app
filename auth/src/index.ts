import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/api/users/currentuser", (req, res) => {
  res.send("hello");
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
