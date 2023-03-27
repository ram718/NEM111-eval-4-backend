const express = require("express");
const app = express();
require("dotenv").config();
const { connection } = require("./db");
const { userRouter } = require("./routes/users.routes");
const { postRouter } = require("./routes/posts.routes");
const { auth } = require("./middleware/auth.middleware");
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.use("/users", userRouter);
app.use(auth);
app.use("/posts", postRouter);

app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log("Connected to db");
  } catch (err) {
    console.log(err);
    console.log("Connection failed");
  }
  console.log(`App is running at port ${process.env.port}`);
});
