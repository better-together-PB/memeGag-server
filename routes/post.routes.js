const express = require("express");
const router = express.Router();

const Post = require("../models/Post.model");
const User = require("../models/User.model");
const Comment = require("../models/Comment.model");

const { isAuthenticated } = require("../middleware/protected.middleware.js");
const { isOwner } = require("../middleware/isOwner.middleware.js");

router.post("/create", isAuthenticated, (req, res, next) => {
  req.body.userId = req.payload._id;
  User.findById(req.payload._id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }
      return Post.create(req.body).then((post) => {
        return User.findByIdAndUpdate(
          req.payload._id,
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
      if (!post) {
        res.status(400).json({ message: "Post does not exist" });
        return;
      }
      res.status(200).json({
        status: "success",
        data: post,
      });
    })
    .catch((err) => next(err));
});

router.patch("/:postId", isAuthenticated, isOwner, (req, res, next) => {
  if (!req.isOwner) {
    return res.status(405).json({
      status: "fail",
      message: "Not allowed to update other users post",
    });
  }

  const { title } = req.body;

  Post.findByIdAndUpdate(req.params.postId, { title }, { new: true })
    .then((post) => {
      res.status(201).json({
        status: "success",
        data: post,
      });
    })
    .catch((err) => next(err));
});

router.delete("/:postId", isAuthenticated, isOwner, (req, res, next) => {
  if (!req.isOwner) {
    return res.status(405).json({
      status: "fail",
      message: "Not allowed to delete other users post",
    });
  }
  Post.findByIdAndDelete(req.params.postId)
    .then((post) => {
      res.status(204).json({ message: "post deleted" });
    })
    .catch((err) => next(err));
});

//////////////////////////////////////////////////////////
////////////////////////////////////////////////////////// Comment Routes
//////////////////////////////////////////////////////////

router.post("/:id/comment", isAuthenticated, (req, res, next) => {
  const postId = req.params.id;
  const userId = req.payload._id;

  const userComment = { postId, userId, comment: req.body.comment };

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
      return Comment.create(userComment);
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

router.post("/:postId/:commentId/like", isAuthenticated, (req, res, next) => {
  const userId = req.payload._id;
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
        return Comment.findByIdAndUpdate(
          commentId,
          { $pull: { likes: userId } }, // $pull removes the userId from the likes array
          { new: true, useFindAndModify: false }
        ).then((asd) => {
          return res.status(204).json({ message: "like from comment deleted" });
        });
      }

      return Comment.findByIdAndUpdate(
        commentId,
        { $push: { likes: userId } },
        { new: true, useFindAndModify: false }
      ).then((updatedComment) => {
        console.log("asd");
        res.status(201).json({
          status: "success",
          // Do we need to send something?
          data: "comment liked",
        });
      });
    })
    .catch((err) => next(err));
});

router.delete("/:postId/:commentId", isAuthenticated, (req, res, next) => {
  const { commentId, postId } = req.params;
  const userId = req.payload._id;

  // Find the comment by ID
  Comment.findById(commentId)
    .then((comment) => {
      if (!comment) {
        // Comment not found
        return res.status(404).json({
          status: "fail",
          message: "Comment not found",
        });
      }

      // Check if the comment belongs to the logged-in user
      if (!comment.userId.equals(userId)) {
        return res.status(403).json({
          status: "fail",
          message: "You are not authorized to delete this comment",
        });
      }

      // Delete the comment
      return Comment.findByIdAndDelete(commentId);
    })
    .then((deletedComment) => {
      if (!deletedComment) {
        // If the comment wasn't deleted, return early
        return;
      }

      // Remove the comment ID from the post's comments array
      return Post.findByIdAndUpdate(
        postId,
        { $pull: { comments: commentId } },
        { new: true, useFindAndModify: false }
      );
    })
    .then((updatedPost) => {
      if (updatedPost) {
        // Successfully removed comment from post
        return res.status(200).json({
          status: "success",
          message: "Comment deleted from post and database",
        });
      }
    })
    .catch((err) => {
      return next(err);
    });
});

module.exports = router;
