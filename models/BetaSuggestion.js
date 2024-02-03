const mongoose = require("mongoose");

const BetaSuggestionSchema = mongoose.Schema({
  message: {
    type: String,
  },
  rating:{ type: String },
  adoptability:{ type: String },
  section: { type: String },
});

const BetaSuggestion = mongoose.model(
  "BetaSuggestion",
  BetaSuggestionSchema,
  "betaSuggestion"
);

module.exports = { BetaSuggestionSchema, BetaSuggestion };
