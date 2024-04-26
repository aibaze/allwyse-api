const mongoose = require("mongoose");

const InternalStatsSchema = mongoose.Schema({
  section: {
    type: String,
  },
  ip: { type: String },
  ipVisitAmount: { type: Number },
  country: { type: String },
});

const InternalStat = mongoose.model(
  "InternalStats",
  InternalStatsSchema,
  "internalStats"
);

module.exports = { InternalStatsSchema, InternalStat };
