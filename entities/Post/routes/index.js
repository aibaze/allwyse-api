const express = require("express");
const { createPost } = require("../controllers");
const postRouter = express.Router();

// PUBLIC ROUTES
postRouter.post("/", createPost);

module.exports = { postRouter };
