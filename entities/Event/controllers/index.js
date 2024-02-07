const { google } = require("googleapis");
const { v4: uuid } = require("uuid");
const dayjs = require("dayjs");
const { Event } = require("../../../models/Event");
const { GoogleInfo } = require("../../../models/GoogleInfo");
const { ObjectId } = require("mongodb");

const auth2Client = new google.auth.OAuth2(
  process.env.CALENAR_CLIENT_KEY,
  process.env.CALENDAR_CLIENT_SECRET,
  "postmessage"
);
const calendar = google.calendar({
  version: "v3",
  auth: process.env.CALENDAR_API_KEY,
});

const createEvent = async (req, res) => {
  let googleError = true;
  try {
    const { attendees, userTimeZone, start, end, title, description, coachId } =
      req.body;
    const googleInfo = await GoogleInfo.findOne({ coachId: new ObjectId(coachId) });

    auth2Client.setCredentials({ refresh_token: googleInfo?.token });

    await calendar.events.insert({
      calendarId: "primary",
      auth: auth2Client,
      conferenceDataVersion: 1,
      requestBody: {
        summary: title,
        description: description,
        start: {
          dateTime: dayjs(start),
          timeZone: userTimeZone,
        },
        end: {
          dateTime: dayjs(end),
          timeZone: userTimeZone,
        },
        conferenceData: {
          createRequest: {
            requestId: uuid(),
          },
        },
        attendees: attendees,
      },
    });
    googleError = false;

    const event = await Event.create({
      ...req.body,
      title: `${req.body.studentName} (${req.body.description})`,
    });
    res.status(201).json({ event });
  } catch (error) {
    if (googleError) {
     await GoogleInfo.deleteOne({ coachId: new ObjectId(req.body.coachId )});
    }
    res.status(500).json({ message: error.message });
  }
};

const getEventsByCoach = async (req, res) => {
  const events = await Event.find({ coachId: req.params.coachId });
  res.json({ events });
};

const checkIfItsAuth = async (req, res) => {
  const googleInfo = await GoogleInfo.findOne({ coachId: req.params.coachId });

  if (!googleInfo) {
    return res.json({
      message: "Not authorized",
      error: "Not authorized",
      statusCode: 403,
    });
  }
  res.json({ message: "OK", error: null });
};
const googleAuth = async (req, res) => {
  const { tokens } = await auth2Client.getToken(req.body.code);
  const body = {
    token: tokens.refresh_token,
    expiresIn: tokens.expiry_date,
    coachId: req.body.coachId,
  };

  await GoogleInfo.deleteMany({ coachId: req.body.coachId });
  await GoogleInfo.create(body);
  res.json({ message: "ok", error: null });
};

const getPublicEventsByCoach = async(req,res) => {
  const events = await Event.find({coachId:req.params.coachId})
  const parsedEvents = events.map(event => {
    return{
      title:"Busy",
      color:event.color,
      start:event.start,
      end:event.end,
      sendEmail:event.sendEmail,
      _id:event._id,
      serviceId:event.serviceId,
      coachId:event.coachId
    }
  })
  res.json({events:parsedEvents})
};

module.exports = { createEvent, getEventsByCoach, checkIfItsAuth, googleAuth ,getPublicEventsByCoach};
