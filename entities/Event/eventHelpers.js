const { Event } = require("../../models/Event");
const { GoogleInfo } = require("../../models/GoogleInfo");
const { ObjectId } = require("mongodb");
const { google } = require("googleapis");
const { v4: uuid } = require("uuid");

const auth2Client = new google.auth.OAuth2(
  process.env.CALENAR_CLIENT_KEY,
  process.env.CALENDAR_CLIENT_SECRET,
  "postmessage"
);
const calendar = google.calendar({
  version: "v3",
  auth: process.env.CALENDAR_API_KEY,
});

const dayjs = require("dayjs");

const createMultipleEventsMethod = async (body) => {
  try {
    const {
      attendees,
      userTimeZone,
      start,
      end,
      title,
      description,
      coachId,
      recurrence,
    } = body;
    let googleEventInfo = {
      calendarLink: "",
      hangoutLink: "",
    };
    const googleInfo = await GoogleInfo.findOne({
      coachId: new ObjectId(coachId),
    });

    auth2Client.setCredentials({
      refresh_token: googleInfo?.refresh_token,
      access_token: googleInfo?.access_token,
    });

    await calendar.events
      .insert({
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
          recurrence: generateGoogleRecurrenceString(recurrence),
        },
      })
      .then((googleResponse) => {
        googleEventInfo = {
          htmlLink: googleResponse.data.htmlLink,
          hangoutLink: googleResponse.data.hangoutLink,
        };
      });
    return googleEventInfo;
  } catch (error) {
    await GoogleInfo.deleteOne({ coachId: new ObjectId(body.coachId) });
    throw new Error(error.message);
  }
};

const createSingleEventMethod = async (body) => {
  try {
    const { attendees, userTimeZone, start, end, title, description, coachId } =
      body;
    let googleEventInfo = {
      calendarLink: "",
      hangoutLink: "",
    };
    const googleInfo = await GoogleInfo.findOne({
      coachId: new ObjectId(coachId),
    });

    auth2Client.setCredentials({
      refresh_token: googleInfo?.refresh_token,
      access_token: googleInfo?.access_token,
    });

    await calendar.events
      .insert({
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
      })
      .then((googleResponse) => {
        googleEventInfo = {
          htmlLink: googleResponse.data.htmlLink,
          hangoutLink: googleResponse.data.hangoutLink,
        };
      });
    return googleEventInfo;
  } catch (error) {
    await GoogleInfo.deleteOne({ coachId: new ObjectId(body.coachId) });
    throw new Error(error.message);
  }
};

async function createRecurringEvents(eventDetails, recurrence) {
  const {
    startDate,
    endDate,
    frequency,
    interval = 1,
    daysOfWeek,
    duration,
  } = recurrence;
  let occurrences = [];
  let currentDate = startDate;

  while (true) {
    if (endDate && currentDate.isAfter(dayjs(endDate))) break;

    // Check if the current date matches the recurrence pattern
    if (matchesRecurrence(currentDate, frequency, daysOfWeek)) {
      const thisStartDate = currentDate.toDate();
      const thisStartDateInMS = currentDate.valueOf();
      const eventInstance = {
        ...eventDetails,
        startDate: thisStartDate,
        start: thisStartDateInMS,
        end: thisStartDateInMS + duration,
      };
      occurrences.push(eventInstance);
    }

    // Move to the next date based on the frequency and interval
    currentDate = getNextDate(currentDate, frequency, interval);
  }

  // Save all occurrences to the database
  const events = await Event.insertMany(occurrences);
  return events;
}

function getShortWeekday(date) {
  const weekdayAbbreviations = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  return weekdayAbbreviations[dayjs(date).day()];
}

function matchesRecurrence(
  date,
  frequency,
  daysOfWeek,
  recurrenceOptions = {}
) {
  const dayMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  switch (frequency) {
    case "daily":
      return true;
    case "weekly":
      return daysOfWeek.includes(getShortWeekday(date));
    case "monthly":
      const { dayOfMonth, dayOfWeek, weekOfMonth } = recurrenceOptions;

      // Case 1: Specific Day of the Month (e.g., 15th of every month)
      if (dayOfMonth) {
        return date.date() === dayOfMonth;
      }

      // Case 2: Specific Weekday of the Month (e.g., second Monday)
      if (dayOfWeek && weekOfMonth) {
        return (
          dayMap[date.day()] === dayOfWeek &&
          Math.ceil(date.date() / 7) === weekOfMonth
        );
      }

      return false;
    default:
      return false;
  }
}

function getNextDate(date, frequency, interval) {
  switch (frequency) {
    case "daily":
      return date.add(interval, "day");
    case "weekly":
      return date.add(interval, "week");
    case "monthly":
      return date.add(interval, "month");
    default:
      throw new Error("Invalid frequency");
  }
}

function generateGoogleRecurrenceString({
  frequency,
  interval,
  daysOfWeek,
  endDate,
}) {
  let rrule = `FREQ=${frequency.toUpperCase()}`;

  if (interval && interval > 1) {
    rrule += `;INTERVAL=${interval}`;
  }

  if (daysOfWeek && daysOfWeek.length > 0) {
    rrule += `;BYDAY=${daysOfWeek.join(",")}`;
  }

  if (endDate) {
    const formattedEndDate =
      new Date(endDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    rrule += `;UNTIL=${formattedEndDate}`;
  }

  return [`RRULE:${rrule}`];
}

module.exports = {
  createMultipleEventsMethod,
  getShortWeekday,
  createSingleEventMethod,
  createRecurringEvents,
};

/* 

const weeklyRecurrence = generateRecurrenceString({
  frequency: 'weekly',
  interval: 1,
  daysOfWeek: ['WE'],
  endDate: '2024-12-30T20:00:00.000Z'
});
console.log(weeklyRecurrence); // "RRULE:FREQ=WEEKLY;BYDAY=WE;UNTIL=20241230T200000Z"

// Daily recurrence without an end date
const dailyRecurrence = generateRecurrenceString({
  startDate: '2024-11-06T11:00:00.000Z',
  frequency: 'daily',
  interval: 1,
});
*/
