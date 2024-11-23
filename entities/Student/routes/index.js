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

// PUBLIC ROUTES
studentRouter.post("/", authMiddleware, createStudent);
studentRouter.get("/coach/:coachId", authMiddleware, getStudentsByCoach);
studentRouter.put(
  "/update/:studentId/coach/:coachId",
  authMiddleware,
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
  deleteStudent
);

module.exports = { studentRouter };
