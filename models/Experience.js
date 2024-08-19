const mongoose = require("mongoose");

const ExperienceSchema = mongoose.Schema({
  _id: {
    type: String,
  },
  area: {
    type: String,
  },
  brand: {
    type: String,
  },
  year: {
    type: String,
  },
});

module.exports = { ExperienceSchema };
