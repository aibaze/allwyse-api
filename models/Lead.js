const mongoose = require("mongoose");

const LeadsSchema = mongoose.Schema({
  email: {
    type: String,
  },
  name: { type: String },
  specialty: { type: String },
});

const Lead = mongoose.model("Lead", LeadsSchema, "lead");

module.exports = { LeadsSchema, Lead };
