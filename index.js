const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const { auth } = require("./routes");
const { errorHandler } = require("./middleware");
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use("/api/auth", auth)
  .use(errorHandler)
  .listen(port, () => console.log(`server started on port ${port}`));
