const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const verifyToken = require("../middlewares/auth");

const Response = require("../response");
const preparedResponse = new Response();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).send(preparedResponse.error("Data missing"));
    }
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id, email }, process.env.TOKEN_KEY, {
        expiresIn: "2d",
      });
      return res.status(200).json(
        preparedResponse.success({
          id: user._id,
          name: user.name,
          email: user.email,
          token,
        })
      );
    }
    return res.status(400).send(preparedResponse.error("Invalid Credentials"));
  } catch (err) {
    return res.status(500).send(preparedResponse.serverError(err.toString()));
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!(email && password && name)) {
      return res.status(400).send(preparedResponse.error("Data missing"));
    }
    const passwordPattern = /^(?:[0-9]+[a-z]|[a-z]+[0-9])[a-z0-9]*$/i;
    if (password.length < 6 || !passwordPattern.test(password)) {
      return res
        .status(400)
        .send(preparedResponse.error("Password is not acceptable"));
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res
        .status(409)
        .send(preparedResponse.error("User Already Exist. Please Login"));
    }
    encryptedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });
    const token = jwt.sign({ id: user._id, email }, process.env.TOKEN_KEY, {
      expiresIn: "2d",
    });
    return res.status(201).json(
      preparedResponse.success({
        id: user._id,
        name: user.name,
        email: user.email,
        token,
      })
    );
  } catch (err) {
    return res.status(500).send(preparedResponse.serverError(err.toString()));
  }
});

router.use(verifyToken);
router.post("/changePassword", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) {
      return res.status(400).send(preparedResponse.error("Data is missing"));
    }
    const { email } = req.user;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      encryptedPassword = await bcrypt.hash(newPassword, 10);

      await User.updateOne(
        {
          email,
        },
        { $set: { password: encryptedPassword } }
      );

      return res.status(200).json(preparedResponse.success(null));
    }
    return res
      .status(400)
      .json(preparedResponse.error("Passwords don't match"));
  } catch (err) {
    return res.status(500).send(preparedResponse.serverError(err.toString()));
  }
});

router.get("/getUserInfo", async (req, res) => {
  try {
    const { email, id } = req.user;
    const user = await User.findOne(
      { email },
      { password: 0, __v: 0, role: 0, _id: 0 }
    );
    if (user._doc) {
      return res
        .status(200)
        .json(preparedResponse.success({ id, ...user._doc }));
    }
    return res.status(400).json(preparedResponse.error("Passwords dont match"));
  } catch (err) {
    return res.status(500).send(preparedResponse.serverError(err.toString()));
  }
});

router.get("/setSocketId/:id", async (req, res) => {
  try {
    const { email, id } = req.user;
    const { id: chatSocketId } = req.params;
    const user = await User.findOneAndUpdate({email}, {$set: { chatSocketId }},
      { returnOriginal: false }
    );
      const { _doc } = user;
      delete _doc.role; delete _doc.__v; delete  _doc._id; delete _doc.password;
      return res
        .status(200)
        .json(preparedResponse.success({ id, ..._doc }));
  } catch (err) {
    return res.status(500).send(preparedResponse.serverError(err.toString()));
  }
});

router.post("/updateUserInfo", async (req, res) => {
  try {
    const { email, id } = req.user;
    const { name, age, address, about, contact, photo, website, occupation } = req.body;
  
    const user = await User.findOneAndUpdate({email}, {$set: {
      name, age, address, about, contact, photo, website, occupation  }},
      { returnOriginal: false }
    );

      const { _doc } = user;
      delete _doc.role; delete _doc.__v; delete  _doc._id; delete _doc.password;
      return res
        .status(200)
        .json(preparedResponse.success({ id, ..._doc }));
  } catch (err) {
    return res.status(500).send(preparedResponse.serverError(err.toString()));
  }
});

module.exports = router;
