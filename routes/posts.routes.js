const express = require("express");
const postRouter = express.Router();
const { PostModel } = require("../model/posts.model");
const jwt = require("jsonwebtoken");

//posting posts
postRouter.post("/add", async (req, res) => {
  const payload = req.body;
  console.log(payload);
  try {
    const post = new PostModel(payload);
    await post.save();
    res.status(200).send({ msg: "New post added succesfully" });
  } catch (error) {
    res.status(400).send({ msg: "Bad Request" });
  }
});

//updating posts
postRouter.patch("/update/:postID", async (req, res) => {
  const { postID } = req.params;
  const payload = req.body;
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "masai");
  const userID = decoded.userID;
  const post = await PostModel.findOne({ _id: postID });
  const userID_in_post = post.userID;

  try {
    if (userID === userID_in_post) {
      await PostModel.findByIdAndUpdate({ _id: postID }, payload);
      res.status(200).send({ msg: "Post has been updated" });
    } else {
      res.status(400).send({ msg: "Not authorized to update" });
    }
  } catch (error) {
    res.status(400).send({ msg: "Bad Request" });
  }
});

//deleting posts
postRouter.delete("/delete/:postID", async (req, res) => {
  const { postID } = req.params;
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "masai");
  const userID = decoded.userID;
  const post = await PostModel.findOne({ _id: postID });
  const userID_in_post = post.userID;

  try {
    if (userID === userID_in_post) {
      await PostModel.findByIdAndDelete({ _id: postID });
      res.status(200).send({ msg: "Post has been deleted" });
    } else {
      res.status(400).send({ msg: "Not authorized to delete" });
    }
  } catch (error) {
    res.status(400).send({ msg: "Bad Request" });
  }
});

//getting posts
postRouter.get("/", async (req, res) => {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "masai");
  const min = +req.query.min;
  const max = +req.query.max;
  const page = +req.query.page;
  const page_limit = (page - 1) * 3 || 0;
  try {
    if (min >= 0 && max > min) {
      const posts = await PostModel.find({
        $and: [
          { userID: decoded.userID },
          {
            $and: [
              { no_of_comments: { $gt: min } },
              { no_of_comments: { $lt: max } },
            ],
          },
        ],
      })
        .skip(page_limit)
        .limit(3);
      res.status(200).send(posts);
    } else {
      const posts = await PostModel.find({ userID: decoded.userID })
        .skip(page_limit)
        .limit(3);
      res.status(200).send(posts);
    }
  } catch (error) {
    res.status(400).send({ msg: "Bad Request" });
  }
});

//top endpoint
postRouter.get("/top", async (req, res) => {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "masai");
  const page = +req.query.page;
  const page_limit = (page - 1) * 3 || 0;
  try {
    const posts = await PostModel.find({ userID: decoded.userID })
      .sort({ no_of_comments: -1 })
      .skip(page_limit)
      .limit(3);
    res.status(200).send(posts);
  } catch (error) {
    res.status(400).send({ msg: "Bad Request" });
  }
});

//device
postRouter.get("/device", async (req, res) => {
  const device = req.query.device;
  const device1 = req.query.device1;
  const device2 = req.query.device2;
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "masai");

  try {
    if (device) {
      const posts = await PostModel.find({
        $and: [{ userID: decoded.userID }, { device: device }],
      });
      res.status(200).send(posts);
    } else if (device1 && device2) {
      const posts = await PostModel.find({
        $and: [
          { userID: decoded.userID },
          { $or: [{ device: device1 }, { device: device2 }] },
        ],
      });
      res.status(200).send(posts);
    }
  } catch (error) {
    res.status(400).send({ msg: "Bad Request" });
  }
});

module.exports = { postRouter };
