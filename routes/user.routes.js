const express = require("express");
const router = express.Router();

const User = require("../models/User.model");

// DONT FORGET TO POPULATE
router.get("/:id", (req, res, next) => {
  User.findById(req.params.id)
    .select(`_id email name profileImage createdAt likes`)
    .then((user) => {
      res.status(200).json({
        status: "success",
        data: user,
      });
    })
    .catch((err) => next(err));
});

// DONT FORGET TO POPULATE
// Combine the two routes
// Check for content value
router.get("/:id/:content", (req, res, next) => {
  User.findById(req.params.id)
    .select(`_id email name profileImage createdAt ${req.params.content}`)
    .then((user) => {
      res.status(200).json({
        status: "success",
        data: user,
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
