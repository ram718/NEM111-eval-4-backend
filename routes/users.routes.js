const express = require("express");
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../model/users.model");

//registeration
userRouter.post("/register", async (req, res) => {
  const { name, email, gender, password, age, city, is_married } = req.body;
  const existing_user = await UserModel.findOne({ email });
  try {
    if (existing_user) {
      res
        .status(400)
        .send({ msg: "User already exists, Please Login to continue" });
    } else {
      bcrypt.hash(password, 5, async (err, hash) => {
        const user = new UserModel({
          name,
          email,
          gender,
          password: hash,
          age,
          city,
          is_married,
        });
        await user.save();
        res.status(200).send({ msg: "User is registered successfully" });
      });
    }
  } catch (err) {
    res.status(400).send({ msg: "Bad Request" });
  }
});

//login
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
          res.status(200).send({
            msg: "Login Successfull",
            token: jwt.sign({ userID: user._id }, "masai"),
          });
        } else {
          res.status(400).send({ msg: "Wrong credentials" });
        }
      });
    } else {
      res.status(400).send({ msg: "Cannot find the user, Please register" });
    }
  } catch (error) {
    res.status(400).send({ msg: "Bad Request" });
  }
});

module.exports = { userRouter };
