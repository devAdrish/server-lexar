require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");

const db = require("./source/database");
db.connect();

app.use(express.json());
// app.use(express.static("public"));
app.use(cors());
// app.use(helmet());

const userRoutes = require("./source/routes/users");

// if (app.get("env") === "development") {
//   app.use(morgan("tiny"));
// }

app.get("/", (_, res) => {
  res.status(200).send("Lexar");
});

app.get("/test/:id", (req, res) => {
  res.status(200).send(req.params.id);
});

app.use(userRoutes);

const hostname = "127.0.0.1";
const port = process.env.PORT || 5000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
