const mongoose = require("mongoose");

const LeadsSchema = mongoose.Schema({
  token: {
    type: String,
  },
  expiresIn: { type: Number },
  coachId: { type: mongoose.Types.ObjectId },
});

const Lead = mongoose.model("Lead", LeadsSchema, "lead");

module.exports = { LeadsSchema, Lead };
