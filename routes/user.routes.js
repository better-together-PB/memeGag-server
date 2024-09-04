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
router.get("/:id/:section", (req, res, next) => {
  console.log(req.params.section);
  User.findById(req.params.id)
    .select(`_id email name profileImage createdAt ${req.params.section}`)
    .then((user) => {
      res.status(200).json({
        status: "success",
        data: user,
      });
    })
    .catch((err) => next(err));
});

module.exports = router;
