const mongoose = require("mongoose");

const StudentSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
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
    progress: {
        type: Number,
    },
    state: {
        type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", StudentSchema,"student")

module.exports = {StudentSchema,Student}
