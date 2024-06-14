const { content } = require("googleapis/build/src/apis/content");
const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema({
  name: {
    type: String,
  },
  postedDate: {
    type: Date,
  },
  ratingNumber: {
    type: Number,
  },
  content: {
    type: String,
  },
});

module.exports = { ReviewSchema };
