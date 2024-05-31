const mongoose = require("mongoose");

const ServiceSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    category: {
      type: String,
    },
    shortDescription: {
      type: String,
    },
    description: {
      type: String,
    },
    serviceType: {
      type: String /* hourly | course | other */,
    },
    price: {
      type: String /* ? */,
    },
    studentAmount: {
      type: String /* ? */,
    },
    certificatedAs: {
      type: String /* ? */,
    },
    serviceLength: {
      type: String /* ? */,
    },
    studentTarget: {
      type: [String] /* ? */,
    },
    skillsLearned: {
      type: [String] /* ? */,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
    },
    profileViews: {
      uniqueVisits: {
        type: Number,
        default: 0,
      },
      totalVisits: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);
const Service = mongoose.model("Service", ServiceSchema);

module.exports = { ServiceSchema, Service };
