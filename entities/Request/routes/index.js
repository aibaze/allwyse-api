const express = require("express");
const {
  createRequest,
  getCoachRequests,
  getCoachRequestTypes,
  getRequestById,
  updateRequestById,
  answerRequest,
  deleteRequest,
  clientAnswerCreatingNewRequest,
  confirmRequest,
  getRequestsByServiceId,
} = require("../controllers");
const requestRouter = express.Router();
const authMiddleware = require("../../../middlewares/AuthMiddleware");
const ownershipMiddleware = require("../../../middlewares/OwnershipMiddleware");

// PUBLIC ROUTES
requestRouter.post("/", createRequest);
requestRouter.post("/answer/:requestId", answerRequest);
requestRouter.post("/client-answer/:requestId", clientAnswerCreatingNewRequest);
requestRouter.get("/:requestId", getRequestById);

// PRIVATE ROUTES
requestRouter.put("/update/:requestId", authMiddleware, updateRequestById);
requestRouter.put("/confirm/:requestId", authMiddleware, confirmRequest);
requestRouter.get("/coach/:coachId", authMiddleware,ownershipMiddleware, getCoachRequests);
requestRouter.get(
  "/service/:serviceId",
  authMiddleware,
  getRequestsByServiceId
);
requestRouter.delete("/:requestId", authMiddleware, deleteRequest);
requestRouter.get(
  "/coach/:coachId/types",
  authMiddleware,
  getCoachRequestTypes
);

module.exports = { requestRouter };
