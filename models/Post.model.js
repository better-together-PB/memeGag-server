const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required."],
      trim: true,
    },
    tags: {
      type: [String],
      enum: [
        "humor",
        "dark humor",
        "programming",
        "comic",
        "gaming",
        "sports",
        "animals",
      ],
      required: [true, "At least 1 tag is required."],
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Post = model("Post", postSchema);

module.exports = Post;
