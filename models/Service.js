const mongoose = require("mongoose");
const { ReviewSchema } = require("./Review");

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
      type: String,
    },
    customSessionMinutes: {
      type: Number,
    },
    sessionPeriodicity: {
      type: String /* hourly | course | other */,
    },
    price: {
      type: String,
    },
    salePrice: {
      type: String,
    },

    hidePrice: {
      type: Boolean,
    },
    mainTopics: {
      type: [String],
    },
    languages: {
      type: [String],
    },
    tags: {
      type: [String],
    },
    published: {
      type: Boolean,
    },
    discount: {
      type: Boolean,
    },
    seatsLeft: {
      type: Number,
      default: 0,
    },
    totalSeats: {
      type: Number,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    color: {
      type: String,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
    },
    reviews: {
      type: [ReviewSchema],
      default: [],
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
