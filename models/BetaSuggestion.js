const mongoose = require("mongoose");

const BetaSuggestionSchema = mongoose.Schema({
  token: {
    type: String,
  },
  expiresIn: { type: Number },
  coachId: { type: mongoose.Types.ObjectId },
});

const BetaSuggestion = mongoose.model(
  "BetaSuggestion",
  BetaSuggestionSchema,
  "betaSuggestion"
);

module.exports = { BetaSuggestionSchema, BetaSuggestion };
