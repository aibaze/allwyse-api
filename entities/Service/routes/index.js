const express = require("express") ;
const {createService,getServicesByCoachId,deleteService,updateService} = require("../controllers")
const serviceRouter = express.Router();

//ROUTES
serviceRouter.post("/create-service/coach/:coachId", createService);
serviceRouter.put("/:serviceId", updateService);
serviceRouter.get("/coach/:coachId", getServicesByCoachId);
serviceRouter.delete("/:serviceId/coach/:coachId", deleteService);

module.exports = { serviceRouter };
