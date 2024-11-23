const express = require("express");
const authMiddleware = require("../../middlewares/AuthMiddleware");
const utilRouter = express.Router();
const { sendEmailController } = require("./controller");

// PRIVATE ROUTES
utilRouter.post("/send-email", authMiddleware, sendEmailController);

module.exports = { utilRouter };
