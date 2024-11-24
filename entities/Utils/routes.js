const express = require("express");
const authMiddleware = require("../../middlewares/AuthMiddleware");
const utilRouter = express.Router();
const {
  sendEmailController,
  executePromptController,
} = require("./controller");

// PRIVATE ROUTES
utilRouter.post("/send-email", authMiddleware, sendEmailController);
utilRouter.post("/execute-prompt", authMiddleware, executePromptController);

module.exports = { utilRouter };
