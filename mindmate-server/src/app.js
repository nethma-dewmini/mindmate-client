const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "MindMate server is running",
    docs: "/api/health",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
