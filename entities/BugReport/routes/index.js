const express = require("express");
const { createReport } = require("../controllers");
const bugReportRouter = express.Router();

// PUBLIC ROUTES
bugReportRouter.post("/", createReport);

module.exports = { bugReportRouter };
