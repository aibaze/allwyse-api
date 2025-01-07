const express = require("express");
const {
  createCoach,
  updateCoach,
  getCoach,
  getCoachBySlug,
  getCoachStats,
  checkSSOToken,
  updateCoachViews,
  updateCoachReviews,
  userEmailExists,
} = require("../controllers");
const coachRouter = express.Router();
const authMiddleware = require("../../../middlewares/AuthMiddleware");
const ownershipMiddleware = require("../../../middlewares/OwnershipMiddleware");

//ROUTES

coachRouter.put("/update-coach/:id", authMiddleware,ownershipMiddleware, updateCoach);
coachRouter.get("/:id", authMiddleware,ownershipMiddleware, getCoach);
//coachRouter.delete("/:id", authMiddleware, deleteCoach);
coachRouter.get("/stats/:id", authMiddleware,ownershipMiddleware, getCoachStats);

// PUBLIC ROUTES
coachRouter.post("/create-coach", createCoach);
coachRouter.get("/user-exists/:email", userEmailExists);
coachRouter.get("/:slug/slug", getCoachBySlug);
coachRouter.post("/check-sso-auth", checkSSOToken);
coachRouter.put("/views/:id", updateCoachViews);
coachRouter.put("/reviews/:id", updateCoachReviews);

module.exports = { coachRouter };
