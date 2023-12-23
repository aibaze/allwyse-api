const express = require("express") ;
const {createService} = require("../controllers")
const serviceRouter = express.Router();

//ROUTES
serviceRouter.post("/create-service/coach/:coachId", createService);

module.exports = { serviceRouter };
