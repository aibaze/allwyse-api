const express = require("express");
const {
  createCoach,
  updateCoach,
  getCoach,
  deleteCoach,
  getCoachBySlug,
  logNewView,
  getCoachStats,
} = require("../controllers");
const coachRouter = express.Router();
const authMiddleware = require("../../../middlewares/AuthMiddleware");

//ROUTES

coachRouter.put("/update-coach/:id", authMiddleware, updateCoach);
coachRouter.get("/:id", authMiddleware, getCoach);
coachRouter.delete("/:id", authMiddleware, deleteCoach);
coachRouter.get("/stats/:id", authMiddleware, getCoachStats);

// PUBLIC ROUTES
coachRouter.post("/create-coach", createCoach);
coachRouter.get("/:slug/slug", getCoachBySlug);
coachRouter.post("/visit", logNewView);

module.exports = { coachRouter };
