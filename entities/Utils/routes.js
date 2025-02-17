const express = require("express");
const axios = require("axios");
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
});
utilRouter.get("/vapi/calls",async (req,res)=>{
  const {data} = await axios.get("https://api.vapi.ai/call",{
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_KEY}`
    }
  })
  res.status(200).json(data)
});

module.exports = { utilRouter };
