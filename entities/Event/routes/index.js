const express = require("express") ;
const {createEvent} = require("../controllers")
const eventRouter = express.Router();

//ROUTES
eventRouter.post("/create-event", createEvent);


module.exports = { eventRouter };
