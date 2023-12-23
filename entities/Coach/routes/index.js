const express = require("express") ;
const {createCoach,updateCoach,getCoach,deleteCoach} = require("../controllers")
const coachRouter = express.Router();

//ROUTES
coachRouter.post("/create-coach", createCoach);

coachRouter.put("/update-coach/:id", updateCoach);

coachRouter.get("/:id", getCoach);

coachRouter.delete("/:id", deleteCoach);

module.exports = { coachRouter };
