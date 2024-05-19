const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  author: {
    name: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    profileUrl: {
      type: String,
    },
  },
  comments: [
    {
      avatarUrl: { type: String },
      coachId: { type: mongoose.Types.ObjectId },
      message: { type: String },
      coachName: { type: String },
      createdAt: { type: Date },
    },
  ],
  content: {
    type: String,
  },
  createdAt: {
    type: String,
  },
  description: {
    type: String,
  },

  metaKeywords: {
    type: [String],
  },

  publish: {
    type: String,
  },
  tags: {
    type: [String],
  },
  title: {
    type: String,
  },
  totalFavorites: {
    type: Number,
  },
  totalShares: {
    type: Number,
  },
  totalViews: {
    type: Number,
  },
  enableComments: {
    type: Boolean,
  },
  coachId: { type: mongoose.Types.ObjectId },
});

const Post = mongoose.model("Post", PostSchema, "post");

module.exports = { PostSchema, Post };
