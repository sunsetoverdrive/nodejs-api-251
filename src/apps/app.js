const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const config = require("config");
const cors = require("cors");
const { connectionRedis } = require("../common/init.redis");
connectionRedis();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(
  "/assets/uploads/images",
  express.static(config.get("app.baseImageUrl")),
);

app.use(
  config.get("app.prefixApiVersion"),
  require(`${__dirname}/../routers/web.js`),
);

module.exports = app;
