const express = require("express");
const {  createStudent,getStudentsByCoach} = require("../controllers");
const authMiddleware = require("../../../middlewares/AuthMiddleware")
const studentRouter = express.Router();

// PUBLIC ROUTES
studentRouter.post("/",authMiddleware, createStudent);
studentRouter.get("/coach/:coachId",authMiddleware, getStudentsByCoach);

module.exports = { studentRouter };
