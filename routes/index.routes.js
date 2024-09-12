const express = require("express");
const router = express.Router();

const getUserInfo = require("../middleware/getUserInfo.middleware.js");
const Post = require("../models/Post.model");

router.get("/", getUserInfo, (req, res, next) => {
  Post.find()
    .populate({
      path: "likes",
      select: "userId -_id",
    })
    .lean()
    .then((posts) => {
      const data = posts
        .map((post) => {
          const isLikedByUser = post.likes.some((likeId) => {
            return likeId.userId.equals(req.userId);
          });
          return {
            ...post,
            likes: post.likes.length,
            comments: post.comments.length,
            isLikedByUser,
          };
        })
        .reverse();
      res.status(200).json({
        status: "success",
        data,
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
