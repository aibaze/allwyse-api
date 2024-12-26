const mongoose = require("mongoose");
const { REQUEST_STATUSES } = require("../constants");
const { QuestionnaireSchema } = require("./Questionnaire");

const RequestSchema = mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    serviceTitle: {
      type: String,
    },
    subject: {
      type: String,
    },
    email: {
      type: String,
    },
    answer: {
      type: String,
    },
    name: {
      type: String,
    },
    lastName: {
      type: String,
    },
    type: {
      type: String,
    },
    priority: {
      type: String,
    },
    message: {
      type: String,
    },
    state: {
      type: String,
      default: REQUEST_STATUSES.NEW,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    requestedDate: {
      type: String,
    },
    requestedTime: {
      type: String,
    },
    googleError: {
      type: Boolean,
    },
    completionStage: {
      type: String,
    },
    questionnaire: {
      type: [QuestionnaireSchema],
    },
  },
  {
    timestamps: true,
  }
);
const Request = mongoose.model("Request", RequestSchema, "request");

module.exports = { RequestSchema, Request };
