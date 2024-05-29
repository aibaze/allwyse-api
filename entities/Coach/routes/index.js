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
coachRouter.post("/create-coach", createCoach);

coachRouter.put("/update-coach/:id", authMiddleware, updateCoach);

coachRouter.get("/:id", authMiddleware, getCoach);

coachRouter.get("/:slug/slug", getCoachBySlug);

coachRouter.delete("/:id", authMiddleware, deleteCoach);

coachRouter.post("/visit", logNewView);
coachRouter.get("/stats/:id", getCoachStats);

module.exports = { coachRouter };
