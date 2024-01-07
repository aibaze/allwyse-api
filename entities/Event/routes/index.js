const express = require("express") ;
const {createEvent,getEventsByCoach,googleAuth,checkIfItsAuth} = require("../controllers")
const eventRouter = express.Router();

//ROUTES
eventRouter.post("/create-event", createEvent);
eventRouter.get('/coach/:coachId', getEventsByCoach);
eventRouter.get('/google/authorized/:coachId', checkIfItsAuth);
eventRouter.post('/google/auth', googleAuth);


module.exports = { eventRouter };
