const express = require("express");
const router = express.Router();

const getUserInfo = require("../middleware/getUserInfo.middleware.js");
const Post = require("../models/Post.model");

router.get("/", getUserInfo, (req, res, next) => {
  Post.find()
    .populate({
      path: "likes",
      select: "userId -_id", // Only include these fields from User
    })
    .lean()
    .then((posts) => {
      const data = posts.map((post) => {
        const isLikedByUser = post.likes.some((likeId) => {
          console.log(likeId);
          console.log(req.userId);

          return likeId.userId.equals(req.userId);
        });
        console.log(isLikedByUser);
        return {
          ...post,
          likes: post.likes.length,
          comments: post.comments.length,
          isLikedByUser,
        };
      });
      res.status(200).json({
        status: "success",
        data,
      });
    });
});

// // GET /api/posts
// router.get("/", getCurrentUserInfo, () => {
//   // req.payload._id
//   Post.find()
//     .populate("likes")
//     .then((postsFromDB) => {
//       const result = postsFromDB.map();
//       res.json(postsFromDB);
//     });
// });

module.exports = router;
