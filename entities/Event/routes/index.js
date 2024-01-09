const express = require("express") ;
const {createEvent,getEventsByCoach,googleAuth,checkIfItsAuth,getPublicEventsByCoach} = require("../controllers")
const eventRouter = express.Router();

// ROUTES
eventRouter.post("/create-event", createEvent);
eventRouter.get('/coach/:coachId', getEventsByCoach);
eventRouter.get('/google/authorized/:coachId', checkIfItsAuth);
eventRouter.post('/google/auth', googleAuth);

// PUBLIC ROUTES
eventRouter.get('/public/coach/:coachId', getPublicEventsByCoach);

module.exports = { eventRouter };
