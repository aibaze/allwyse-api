const express = require("express");
const { createSuggestion } = require("../controllers");
const suggestionRouter = express.Router();

// PUBLIC ROUTES
suggestionRouter.post("/", createSuggestion);

module.exports = { suggestionRouter };
