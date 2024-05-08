const mongoose = require("mongoose");

const InternalStatsSchema = mongoose.Schema(
  {
    section: {
      type: String,
    },
    ip: { type: String },
    ipVisitAmount: { type: Number },
    country: { type: String },
    state: { type: String },
  },
  {
    timestamps: true,
  }
);

const InternalStat = mongoose.model(
  "InternalStats",
  InternalStatsSchema,
  "internalStats"
);

module.exports = { InternalStatsSchema, InternalStat };
