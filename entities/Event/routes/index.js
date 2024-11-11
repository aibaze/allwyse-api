const express = require("express");
const {
  createEvent,
  getEventsByCoach,
  googleAuth,
  checkIfItsAuth,
  getPublicEventsByCoach,
} = require("../controllers");
const eventRouter = express.Router();
const authMiddleware = require("../../../middlewares/AuthMiddleware");

// ROUTES
eventRouter.post("/create-event", authMiddleware, createEvent);
eventRouter.get("/coach/:coachId", authMiddleware, getEventsByCoach);
eventRouter.get("/google/authorized/:coachId", authMiddleware, checkIfItsAuth);
eventRouter.post("/google/auth", authMiddleware, googleAuth);

// PUBLIC ROUTES
eventRouter.get("/public/coach/:coachId", getPublicEventsByCoach);

module.exports = { eventRouter };
