const mongoose = require("mongoose");

const StudentSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email  is required"],
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    unpaidServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    questionaries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    profileImg: {
      type: String,
    },
    sessions: {
      type: Number,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    fullName: {
      type: String,
    },
    noteAbout: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    bills: {
      type: [
        {
          serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
          },
          serviceImg: {
            type: String,
          },
          serviceTitle: {
            type: String,
          },
          date: {
            type: String,
          },
          amount: {
            type: String,
          },
          status: {
            type: String,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", StudentSchema, "student");

module.exports = { StudentSchema, Student };
