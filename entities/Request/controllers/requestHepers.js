const { Service } = require("../../../models/Service");
const { Request } = require("../../../models/Request");
const Coach = require("../../../models/Coach");
const { Student } = require("../../../models/Student");
const { Event } = require("../../../models/Event");
const dayjs = require("dayjs");

const { ObjectId } = require("mongodb");

const getRequestInformation = async (requestId) => {
  const currentRequest = await Request.findOne({
    _id: new ObjectId(requestId),
  });
  const currentServiceReq = Service.findOne({
    _id: new ObjectId(currentRequest.serviceId),
  });
  const currentCoachReq = Coach.findOne({
    _id: new ObjectId(currentRequest.coachId),
  });

  const [currentService, currentCoach] = await Promise.all([
    currentServiceReq,
    currentCoachReq,
  ]);

  return { currentRequest, currentService, currentCoach };
};

const createClientFromRequest = async (currentRequest) => {
  let client = await Student.findOne({
    email: currentRequest.email,
    coachId: currentRequest.coachId,
  });

  if (!client) {
    await Student.create({
      email: currentRequest.email,
      firstName: currentRequest.name,
      fullName: currentRequest.name,
      coachId: currentRequest.coachId,
      services: [currentRequest.serviceId],
      appointments: [],
    });
    client = await Student.findOne({
      email: currentRequest.email,
      coachId: currentRequest.coachId,
    });
  } else {
    await Student.updateOne(
      { _id: new ObjectId(client._id) },
      {
        $push: {
          services: currentRequest.serviceId,
        },
      }
    );
  }

  return client;
};

const updateRequestStakeholdersInformation = async ({
  client,
  event,
  currentRequest,
  currentService,
}) => {
  await Student.updateOne(
    { _id: new ObjectId(client._id) },
    {
      $set: {
        appointments: [...client.appointments, event._id],
      },
    }
  );
  await Coach.updateOne(
    { _id: new ObjectId(currentRequest.coachId) },
    {
      $push: {
        students: client._id,
      },
    }
  );
  await Service.updateOne(
    { _id: new ObjectId(currentRequest.serviceId) },
    {
      $set: {
        seatsLeft: currentService.seatsLeft - 1,
      },
    }
  );
};

async function createRecurringEvents(eventDetails, recurrence) {
  const {
    startDate,
    endDate,
    frequency,
    interval = 1,
    daysOfWeek,
  } = recurrence;
  let occurrences = [];
  let currentDate = dayjs(startDate);

  while (true) {
    if (endDate && currentDate.isAfter(dayjs(endDate))) break;

    // Check if the current date matches the recurrence pattern
    if (matchesRecurrence(currentDate, frequency, daysOfWeek)) {
      const eventInstance = {
        ...eventDetails,
        startDate: currentDate.toDate(),
        // Calculate end time based on duration
        endDate: currentDate.add(eventDetails.duration, "minute").toDate(),
      };
      occurrences.push(eventInstance);
    }

    // Move to the next date based on the frequency and interval
    currentDate = getNextDate(currentDate, frequency, interval);
  }

  // Save all occurrences to the database
  await Event.insertMany(occurrences);
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
      return daysOfWeek.includes(dayMap[date.day()]);
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

module.exports = {
  getRequestInformation,
  updateRequestStakeholdersInformation,
  createClientFromRequest,
};
