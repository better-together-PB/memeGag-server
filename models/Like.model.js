const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const likeSchema = new Schema({
  user: [{ type: Schema.Types.ObjectId, ref: "User" }],
  post: [{ type: Schema.Types.ObjectId, ref: "Post" }],
});

const Like = model("Like", likeSchema);

module.exports = Like;
