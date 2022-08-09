const express = require("express");
const app = express();

const hostname = "127.0.0.1";
const port = process.env.PORT || 5000;

const users = [
  {
    name: "saad",
    password: "1234",
  },
  {
    name: "saad",
    password: "1234",
  },
];
app.get("/", (_, res) => {
  res.status(200).send("Lexar Server Running.");
});

app.post("/api/login", (req, res) => {
  if (users.includes(req.body)) return res.status(200).send("user exists");
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
