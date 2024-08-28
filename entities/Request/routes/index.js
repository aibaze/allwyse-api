const express = require("express");
const {
  createRequest,
  getCoachRequests,
  getCoachRequestTypes,
  getRequestById,
  updateRequestById,
  answerRequest,
  deleteRequest,
} = require("../controllers");
const requestRouter = express.Router();
const authMiddleware = require("../../../middlewares/AuthMiddleware");

// PUBLIC ROUTES
requestRouter.post("/", createRequest);
requestRouter.post("/answer/:requestId", answerRequest);
requestRouter.put("/update/:requestId", authMiddleware, updateRequestById);
requestRouter.get("/coach/:coachId", authMiddleware, getCoachRequests);
requestRouter.get("/:requestId", authMiddleware, getRequestById);
requestRouter.delete("/:requestId", authMiddleware, deleteRequest);
requestRouter.get(
  "/coach/:coachId/types",
  authMiddleware,
  getCoachRequestTypes
);

module.exports = { requestRouter };
