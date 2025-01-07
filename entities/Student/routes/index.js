const express = require("express");
const {
  createStudent,
  getStudentsByCoach,
  deleteStudent,
  updateStudentPaymentStatus,
  updateStudent,
} = require("../controllers");
const authMiddleware = require("../../../middlewares/AuthMiddleware");
const studentRouter = express.Router();
const ownershipMiddleware = require("../../../middlewares/OwnershipMiddleware");

// PUBLIC ROUTES
studentRouter.post("/", authMiddleware, createStudent);
studentRouter.get("/coach/:coachId", authMiddleware, ownershipMiddleware,getStudentsByCoach);
studentRouter.put(
  "/update/:studentId/coach/:coachId",
  authMiddleware,
  ownershipMiddleware,
  updateStudent
);
studentRouter.put(
  "/update-payment-status",
  authMiddleware,
  updateStudentPaymentStatus
);
studentRouter.delete(
  "/coach/:coachId/student/:studentId",
  authMiddleware,
  ownershipMiddleware,
  deleteStudent
);

module.exports = { studentRouter };
