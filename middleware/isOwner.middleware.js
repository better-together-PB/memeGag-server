const Post = require("../models/Post.model");

const isOwner = (req, res, next) => {
  Post.findById(req.params.postId)
    .then((post) => {
      if (!post) {
        res.status(400).json({ message: "Post does not exist" });
        return;
      }
      if (post.userId.equals(req.payload._id)) {
        req.isOwner = true;
      } else {
        req.isOwner = false;
      }
    })
    .catch((error) => next(err))
    .finally(() => next());
};

module.exports = {
  isOwner,
};
