const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
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
