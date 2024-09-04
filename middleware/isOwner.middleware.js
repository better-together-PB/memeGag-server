const Post = require("../models/Post.model");

const isOwner = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      console.log(post);
      if (!post) {
        res.status(400).json({ message: "Post does not exist" });
        return;
      }
      if (!post.userId.equals(req.payload._id)) {
        req.isOwner = false;
      } else {
        req.isOwner = true;
      }
    })
    .catch((error) => next(err))
    .finally(() => next());
};

module.exports = {
  isOwner,
};

/* return res.status(403).json({
    status: "fail",
    message: "Cannot perform this action",
  }); */
