const express = require("express");
const app = express();
const bcrypt =require('bcryptjs')
const jwt = require('jsonwebtoken');
const db = require('./source/database')
db.connect();
app.use(express.json());
const User = require("./source/models/user");

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
      return res.status(400).send("All input is required");
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

      user.token = token;

      return res.status(200).json(user);
    }
    return res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!(email && password && name)) {
     return res.status(400).send("All input is required");
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

    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;
    return res.status(201).json({user});
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
