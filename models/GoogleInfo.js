const mongoose = require("mongoose");

const GoogleInfoSchema = mongoose.Schema({
  token: {
    type: String,
  },
  access_token: {
    type: String,
  },
  expiresIn: { type: Number },
  coachId: { type: mongoose.Types.ObjectId },
});

const GoogleInfo = mongoose.model("GoogleInfo", GoogleInfoSchema, "googleInfo");

module.exports = { GoogleInfoSchema, GoogleInfo };
