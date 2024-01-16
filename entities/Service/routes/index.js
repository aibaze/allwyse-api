const express = require("express") ;
const {createService,getServicesByCoachId,deleteService,updateService} = require("../controllers")
const serviceRouter = express.Router();
const authMiddleware = require("../../../middlewares/AuthMiddleware")

//ROUTES
serviceRouter.post("/create-service/coach/:coachId",authMiddleware, createService);
serviceRouter.put("/:serviceId", authMiddleware,updateService);
serviceRouter.delete("/:serviceId/coach/:coachId", authMiddleware,deleteService);

// PUBLIC ROUTES
serviceRouter.get("/coach/:coachId", getServicesByCoachId);

module.exports = { serviceRouter };
