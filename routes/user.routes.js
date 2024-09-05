const express = require("express");
const router = express.Router();

const User = require("../models/User.model");

// FIND A WAY TO GET THE NUMBER OF OBJECTIDS IN THE LIKES / POSTS / COMMENTS ARRAY AND JUST GET THAT NUMBER
router.get("/:id/:content?", (req, res, next) => {
  console.log("ok");
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
    .populate(content)
    .then((user) => {
      if (!user) {
        res.status(400).json({ message: "User does not exist" });
        return;
      }
      res.status(200).json({
        status: "success",
        data: user,
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
