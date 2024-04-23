const mongoose = require("mongoose");

const BugReportSchema = mongoose.Schema({
  description: {
    type: String,
  },
  category: { type: String },
  email: { type: String },
});

const BugReport = mongoose.model(
  "BugReport",
  BugReportSchema,
  "betaSuggestion"
);

module.exports = { BugReportSchema, BugReport };
