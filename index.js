require("dotenv").config();
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./source/database");
const cors = require("cors");

db.connect();
app.use(express.json());
app.use(cors());

const User = require("./source/models/user");
const verifyToken = require("./source/middlewares/auth");

const hostname = "127.0.0.1";
const port = process.env.PORT || 5000;

app.get("/", (_, res) => {
  res.status(200).send("Lexar");
});

app.get("/status", (_, res) => {
  res.status(200).send("Lexar Server Running.");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send("Data missing");
    }
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      return res.status(200).json({ name: user.name, email: user.email, token });
    }
    return res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!(email && password && name)) {
    return res.status(400).send("Data missing");
  }

  const oldUser = await User.findOne({ email });

  if (oldUser) {
    return res.status(409).send("User Already Exist. Please Login");
  }

  encryptedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: encryptedPassword,
  });

  const token = jwt.sign({ user_id: user._id, email }, process.env.TOKEN_KEY, {
    expiresIn: "2h",
  });
  user.token = token;
  return res.status(201).json({ user });
});

app.use("/changePassword", verifyToken);
app.post("/changePassword", async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword && newPassword)) {
    return res.status(400).send("Data is missing");
  }
  const { email } = req.user;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(oldPassword, user.password))) {
    encryptedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      {
        email,
      },
      { $set: {password: encryptedPassword} }
    );

    return res.status(200).json("success");
  }

  return res.status(400).json("Passwords dont match");
});

app.use("/getUserInfo", verifyToken);
app.get("/getUserInfo", async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(200).json(user);
  }
  return res.status(400).json("Passwords dont match");
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
