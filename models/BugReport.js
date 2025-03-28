const mongoose = require("mongoose");

const BugReportSchema = mongoose.Schema(
  {
    description: {
      type: String,
    },
    category: { type: String },
    email: { type: String },
  },
  {
    timestamps: true,
  }
);

const BugReport = mongoose.model("BugReport", BugReportSchema, "bugReport");

module.exports = { BugReportSchema, BugReport };
