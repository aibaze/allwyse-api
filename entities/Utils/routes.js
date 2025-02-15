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
utilRouter.post("/vapi/end-of-call", (req,res)=>{
console.log(req.body,"BODY")
console.log(req.headers,"HEADERS")
});

module.exports = { utilRouter };
