const express = require("express");
const router = express.Router();

const User = require("../models/User.model");
const getUserInfo = require("../middleware/getUserInfo.middleware.js");

// FIND A WAY TO GET THE NUMBER OF OBJECTIDS IN THE LIKES / POSTS / COMMENTS ARRAY AND JUST GET THAT NUMBER
router.get("/:id/:content?", getUserInfo, (req, res, next) => {
  if (!req.params.content) {
    req.params.content = "likes";
  }
  const content = req.params.content.toLowerCase();

  if (!["likes", "posts", "comments"].includes(content)) {
    return res.status(404).json({
      status: "fail",
      message: "Content not found",
    });
  }

  User.findById(req.params.id)
    .select(`_id email name profileImage createdAt ${content}`)
    .populate({
      path: content,
      select: "postId",
      populate: {
        path: `${content === "posts" ? "_id" : "postId"}`,
        populate: {
          path: `${content === "posts" ? "_id" : "likes"}`,
          select: "userId -_id",
        },
      },
    })
    .lean()
    .then((user) => {
      if (!user) {
        res.status(400).json({ message: "User does not exist" });
        return;
      }
      console.log(user[content]);
      res.status(200).json({
        status: "success",
        data: user,
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
