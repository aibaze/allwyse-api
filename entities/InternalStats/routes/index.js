const express = require("express");
const { createStat, getStats } = require("../controllers");
const internalStatRouter = express.Router();

// PUBLIC ROUTES
internalStatRouter.post("/", createStat);
internalStatRouter.get("/", getStats);

module.exports = { internalStatRouter };
