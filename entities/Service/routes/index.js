const express = require("express");
const {
  createService,
  getServicesByCoachId,
  deleteService,
  updateService,
  logNewView,
  getServiceStats,
  updateServiceReviews,
  getServiceById,
  updateServiceViews,
} = require("../controllers");
const serviceRouter = express.Router();
const authMiddleware = require("../../../middlewares/AuthMiddleware");

//ROUTES
serviceRouter.post(
  "/create-service/coach/:coachId",
  authMiddleware,
  createService
);
serviceRouter.put("/:serviceId", authMiddleware, updateService);
serviceRouter.get("/:serviceId", getServiceById);
serviceRouter.delete(
  "/:serviceId/coach/:coachId",
  authMiddleware,
  deleteService
);

// PUBLIC ROUTES
serviceRouter.get("/coach/:coachId", getServicesByCoachId);
serviceRouter.put("/reviews/:serviceId", updateServiceReviews);
serviceRouter.put("/views/:serviceId", updateServiceViews);

serviceRouter.post("/visit", logNewView);
serviceRouter.get("/stats/:coachId", getServiceStats);

module.exports = { serviceRouter };
