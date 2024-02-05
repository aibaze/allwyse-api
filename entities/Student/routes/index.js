const express = require("express");
const {  createStudent} = require("../controllers");
const studentRouter = express.Router();

// PUBLIC ROUTES
studentRouter.post("/", createStudent);

module.exports = { studentRouter };
