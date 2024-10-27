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

const createEventMethod = async (body) => {
  let googleError = true;

  try {
    const { attendees, userTimeZone, start, end, title, description, coachId } =
      body;
    const googleInfo = await GoogleInfo.findOne({
      coachId: new ObjectId(coachId),
    });
    console.log(googleInfo, "google info");

    auth2Client.setCredentials({
      refresh_token: googleInfo?.token,
      access_token: googleInfo?.access_token,
    });
    // Get information about the new access token
    const tokenInfo = await auth2Client.getTokenInfo(
      auth2Client.credentials.access_token
    );
    console.log("Token Info:", tokenInfo);
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
    let studentId = "";
    try {
      const student = await Student.findOne({
        email: body.studentEmail,
        coachId: new ObjectId(body.coachId),
      });
      studentId = student._id;
    } catch (error) {}
    const event = await Event.create({
      ...body,
      studentId: studentId,
      startDate: body.startDate || new Date(body.start),
      createdAt: new Date(),
      title: `${body.studentName} (${body.description})`,
    });
    return event;
  } catch (error) {
    if (googleError) {
      await GoogleInfo.deleteOne({ coachId: new ObjectId(body.coachId) });
    }
    return { error: error.message };
  }
};

const createEvent = async (req, res) => {
  const event = createEventMethod(req.body);
  if (event.error) {
    res.status(500).json({ message: event.error });
  } else {
    res.status(201).json({ event });
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
      access_token: tokens.access_token,
      coachId: req.body.coachId,
    };
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
  createEventMethod,
};
