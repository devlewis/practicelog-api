require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const authRouter = require("./auth/auth-router");
const practicelogRouter = require("./prlog/practicelog-router");
const usersRouter = require("./users/users-router");
const { CLIENT_ORIGIN } = require("./config");
const app = express();

app.use(
  morgan(NODE_ENV === "production" ? "tiny" : "common", {
    skip: () => NODE_ENV === "test",
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.use(helmet());

app.use("/api/prlog", practicelogRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: "Server error" };
  } else {
    console.error(error);
    response = { error: error.message, object: error };
  }
  res.status(500).json(response);
});

module.exports = app;
