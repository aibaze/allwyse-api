const mongoose = require("mongoose");

const EventSchema = mongoose.Schema({
  title: {
    type: String,
  },
  color: {
    type: String,
  },
  sendEmail: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
  },
  startDate: {
    type: Date,
  },
  start: {
    type: Number,
  },
  end: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  studentEmail: {
    type: String,
  },
  studentId: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        return mongoose.Types.ObjectId.isValid(value) || value === "";
      },
      message: (props) =>
        `${props.value} is not a valid ObjectId or empty string!`,
    },
    default: "",
  },
  studentName: {
    type: String,
  },
  serviceId: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        // Permitir ObjectId y cadenas vacías
        return mongoose.Types.ObjectId.isValid(value) || value === "";
      },
      message: (props) =>
        `${props.value} is not a valid ObjectId or empty string!`,
    },
    default: "",
  },
  coachId: { type: mongoose.Types.ObjectId },
});

const Event = mongoose.model("Event", EventSchema);

module.exports = { EventSchema, Event };
