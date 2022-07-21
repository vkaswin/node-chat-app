const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const { auth } = require("./routes");
const port = process.env.PORT;
connectDB();

const app = express();

app
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use("/api/auth", auth)
  .listen(port, () => console.log(`Server started on port ${port}`));
