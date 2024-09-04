const express = require("express");
const router = express.Router();

const Post = require("../models/Post.model");
const User = require("../models/User.model");
const Comment = require("../models/Comment.model");

router.post("/create", (req, res, next) => {
  User.findById(req.body.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }
      return Post.create(req.body).then((post) => {
        return User.findByIdAndUpdate(
          req.body.userId,
          { $push: { posts: post._id } },
          { new: true, useFindAndModify: false }
        ).then(() => {
          res.status(201).json({
            status: "success",
            data: post,
          });
        });
      });
    })
    .catch((err) => next(err));
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id)
    .populate({ path: "userId", select: "_id name" })
    .then((post) => {
      res.status(200).json({
        status: "success",
        data: post,
      });
    })
    .catch((err) => next(err));
});

router.post("/:id/comment", (req, res, next) => {
  const { userId, postId } = req.body;

  // Step 1: Verify the user exists
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }
      return Post.findById(postId);
    })
    .then((post) => {
      if (!post) {
        return res.status(404).json({
          status: "fail",
          message: "Post not found",
        });
      }
      return Comment.create(req.body);
    })
    .then((comment) => {
      const userUpdate = User.findByIdAndUpdate(
        userId,
        { $push: { comments: comment._id } },
        { new: true, useFindAndModify: false }
      );
      const postUpdate = Post.findByIdAndUpdate(
        postId,
        { $push: { comments: comment._id } },
        { new: true, useFindAndModify: false }
      );
      return Promise.all([userUpdate, postUpdate]).then(() => comment);
    })
    .then((comment) => {
      res.status(201).json({
        status: "success",
        data: comment,
      });
    })
    .catch((err) => next(err));
});

router.post("/:postId/:commentId/like", (req, res, next) => {
  const { userId } = req.body;
  const { postId, commentId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }
      return Post.findById(postId);
    })
    .then((post) => {
      if (!post) {
        return res.status(404).json({
          status: "fail",
          message: "Post not found",
        });
      }
      if (!post.comments.includes(commentId)) {
        return res.status(404).json({
          status: "fail",
          message: "Comment does not belong to that post",
        });
      }
      // Try to refactor and directly update

      return Comment.findById(commentId);
    })
    .then((comment) => {
      if (!comment) {
        return res.status(404).json({
          status: "fail",
          message: "Comment not found",
        });
      }

      if (comment.likes.includes(userId)) {
        return res.status(400).json({
          status: "fail",
          message: "You already liked this comment",
        });
      }

      return Comment.findByIdAndUpdate(
        commentId,
        { $push: { likes: userId } },
        { new: true, useFindAndModify: false }
      );
    })
    .then((updatedComment) => {
      res.status(201).json({
        status: "success",
        // Do we need to send something?
        data: updatedComment.likes,
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
