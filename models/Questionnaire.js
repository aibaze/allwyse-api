const mongoose = require("mongoose");

const QuestionnaireSchema = mongoose.Schema({
  question: {
    type: String,
    default: "",
  },
  answer: { type: String, default: "" },
});

const Questionnaire = mongoose.model(
  "Questionnaire",
  QuestionnaireSchema,
  "questionnaire"
);

const QuestionnaireGroupSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  questionnaire: [QuestionnaireSchema],
});

module.exports = {
  QuestionnaireSchema,
  Questionnaire,
  QuestionnaireGroupSchema,
};
