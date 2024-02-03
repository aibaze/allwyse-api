const express = require("express");
const { createLead } = require("../controllers");
const leadRouter = express.Router();

// PUBLIC ROUTES
leadRouter.post("/", createLead);

module.exports = { leadRouter };
