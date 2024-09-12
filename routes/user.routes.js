const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../models/User.model");
const getUserInfo = require("../middleware/getUserInfo.middleware.js");

router.get("/details/:id", getUserInfo, (req, res, next) => {
  User.findById(req.params.id)
    .select("profileImage name")
    .then((data) => {
      res.status(200).json({
        status: "success",
        data,
      });
    })
    .catch((err) => next(err));
});

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
      populate: {
        path: `${content === "posts" ? "likes" : "postId"}`,
        ...(content !== "posts" && {
          populate: {
            path: "likes",
            select: "userId -_id",
          },
        }),
      },
    })
    .lean()
    .then((user) => {
      if (!user) {
        res.status(400).json({ message: "User does not exist" });
        return;
      }

      let posts;
      if (content === "posts") {
        posts = user[content];
      } else {
        posts = user[content].map((p) => p.postId);
      }

      const postsModified = posts
        .filter(
          (obj, index, self) =>
            index === self.findIndex((o) => o._id === obj._id)
        )
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

      const data = {
        id: user._id,
        email: user.email,
        username: user.name,
        profileImage: user.profileImage,
        posts: postsModified,
      };

      res.status(200).json({
        status: "success",
        data,
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
