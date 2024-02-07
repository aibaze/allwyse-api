const mongoose = require("mongoose");

const EventSchema = mongoose.Schema({
  title: {
    type: String,
  },
  color: {
    type: String ,
  },
  sendEmail: {
    type: Boolean,
  },
  start: {
    type: Number,
  },
  end: {
    type: Number,
  },
  duration:{
    type: Number
  },
  studentEmail: {
    type: String,
  },
  studentId: {
    type: mongoose.Types.ObjectId,
  },
  studentName: {
    type: String,
  },
  serviceId: { type: mongoose.Types.ObjectId },
  coachId: { type: mongoose.Types.ObjectId },
});

const Event = mongoose.model("Event", EventSchema);

module.exports = { EventSchema, Event };
