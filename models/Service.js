const mongoose = require("mongoose");

const ServiceSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    image: {
      type: String,
    },
    thumb: {
      type: String,
    },
    workDays: {
      type: [String],
    },
    sessionDuration: {
      type: String /* ? */,
    },
    customSessionMinutes: {
      type: Number,
    },
    sessionPeriodicity: {
      type: String /* hourly | course | other */,
    },
    price: {
      type: String /* ? */,
    },
    salePrice: {
      type: String /* ? */,
    },

    hidePrice: {
      type: Boolean /* ? */,
    },
    mainTopics: {
      type: [String] /* ? */,
    },
    languages: {
      type: [String] /* ? */,
    },
    tags: {
      type: [String] /* ? */,
    },
    published: {
      type: Boolean /* ? */,
    },
    discount: {
      type: Boolean /* ? */,
    },
    seatsLeft: {
      type: Number /* ? */,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
    },
    views: {
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
