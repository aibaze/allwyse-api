const express = require("express");
const { createStat } = require("../controllers");
const internalStatRouter = express.Router();

// PUBLIC ROUTES
internalStatRouter.post("/", createStat);

module.exports = { internalStatRouter };
