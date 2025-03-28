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
utilRouter.post("/vapi/my-tool", (req,res)=>{
  console.log(req.body,"BODY")
  console.log(req.headers,"HEADERS")

  });
utilRouter.get("/vapi/calls",async (req,res)=>{
  try {
    const {data} = await axios.get("https://api.vapi.ai/call",{
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_KEY}`
      }
    })
    res.status(200).json({calls:data})
  } catch (error) {
    console.log("ERROR",error.message)
    
  }

});
utilRouter.get("/vapi/assistants",async (req,res)=>{
  try {
    const {data} = await axios.get("https://api.vapi.ai/assistant",{
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_KEY}`
      }
    })
    res.status(200).json({assistants:data})
  } catch (error) {
    console.log("ERROR",error.message)
    
  }

});

module.exports = { utilRouter };
