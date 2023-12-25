const express = require("express") ;
const {createService,getServicesByCoachId} = require("../controllers")
const serviceRouter = express.Router();

//ROUTES
serviceRouter.post("/create-service/coach/:coachId", createService);
serviceRouter.get("/coach/:coachId", getServicesByCoachId);

module.exports = { serviceRouter };
