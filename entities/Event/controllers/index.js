const { google } = require("googleapis");
const { v4: uuid } = require("uuid");
const dayjs = require("dayjs");
const { Event } = require("../../../models/Event");
const { GoogleInfo } = require("../../../models/GoogleInfo");
const { ObjectId } = require("mongodb");
const { Student } = require("../../../models/Student");

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
  let googleError = false; //true;
  const email = req.loggedUser.email || req.loggedUser;

  try {
    if (email.includes("bymelinaviera")) {
      console.log("Creating google event for coach");
      const {
        attendees,
        userTimeZone,
        start,
        end,
        title,
        description,
        coachId,
      } = req.body;
      const googleInfo = await GoogleInfo.findOne({
        coachId: new ObjectId(coachId),
      });
      console.log(googleInfo, "google info");

      auth2Client.setCredentials({ refresh_token: googleInfo?.token });
      const newToken = await auth2Client.refreshAccessToken();
      auth2Client.setCredentials(newToken.credentials);
      console.log(auth2Client);
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
    }

    googleError = false;
    let studentId = "";
    try {
      const student = await Student.findOne({
        email: req.body.studentEmail,
        coachId: new ObjectId(req.body.coachId),
      });
      studentId = student._id;
    } catch (error) {}
    const event = await Event.create({
      ...req.body,
      studentId: studentId,
      startDate: req.body.startDate || new Date(req.body.start),
      createdAt: new Date(),
      title: `${req.body.studentName} (${req.body.description})`,
    });
    res.status(201).json({ event });
  } catch (error) {
    console.log(error);
    console.log(error.response?.data);
    console.log(error.response?.data.error.errors);
    console.log(error.response?.data.error.details);
    if (googleError) {
      await GoogleInfo.deleteOne({ coachId: new ObjectId(req.body.coachId) });
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
  try {
    const { tokens } = await auth2Client.getToken(req.body.code);
    const body = {
      token: tokens.refresh_token,
      expiresIn: tokens.expiry_date,
      coachId: req.body.coachId,
    };
    console.log(tokens);
    await GoogleInfo.deleteMany({ coachId: req.body.coachId });
    await GoogleInfo.create(body);
    res.json({ message: "ok", error: null });
  } catch (error) {
    res.json({ message: error.message, error: true });
  }
};

const getPublicEventsByCoach = async (req, res) => {
  const events = await Event.find({ coachId: req.params.coachId });
  const parsedEvents = events.map((event) => {
    return {
      title: "Busy",
      color: event.color,
      start: event.start,
      end: event.end,
      sendEmail: event.sendEmail,
      _id: event._id,
      serviceId: event.serviceId,
      coachId: event.coachId,
    };
  });
  res.json({ events: parsedEvents });
};

module.exports = {
  createEvent,
  getEventsByCoach,
  checkIfItsAuth,
  googleAuth,
  getPublicEventsByCoach,
};
