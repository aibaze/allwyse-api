const { Request } = require("../../../models/Request");
const { Event } = require("../../../models/Event");
const { ObjectId } = require("mongodb");
const dayjs = require("dayjs");
const {
  REQUEST_STATUSES,
  REQUEST_TYPES,
  SEEN_REQUEST_STATUSES,
} = require("../../../constants");
const {
  createMultipleEventsMethod,
  createSingleEventMethod,
  createRecurringEvents,
  getShortWeekday,
} = require("../../Event/eventHelpers");
const Coach = require("../../../models/Coach");
const { Service } = require("../../../models/Service");
const { sendEmailTemplate, EMAIL_TEMPLATES } = require("../../../utils/email");
const { isoDateToUTCisoDate } = require("../../../utils/date");
const { getFirstDateOfNextYearISO } = require("../../../utils/date");
const {
  getRequestInformation,
  createClientFromRequest,
  updateRequestStakeholdersInformation,
} = require("./requestHepers");
const { notifyError } = require("../../../utils/error");

const createRequest = async (req, res) => {
  try {
    let payload = req.body;
    if (payload.serviceId) {
      const service = await Service.findOne({
        _id: new ObjectId(payload.serviceId),
      });
      payload = {
        ...payload,
        requestedDate: isoDateToUTCisoDate(payload.requestedDate),
        requestedTime: isoDateToUTCisoDate(payload.requestedTime),
        serviceTitle: service.title,
      };
    }
    const request = await Request.create(payload);
    res.status(201).json({ request });
  } catch (error) {
    notifyError(new Error(error));
    res.status(500).json({ message: error.message });
  }
};
const deleteRequest = async (req, res) => {
  try {
    const email = req.loggedUser.email || req.loggedUser;
    const coach = await Coach.findOne({ email });

    const request = await Request.findOne({
      _id: new ObjectId(req.params.requestId),
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (coach?._id?.toString() !== request?.coachId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this request" });
    }

    await Request.deleteOne({
      _id: new ObjectId(req.params.requestId),
    });
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    notifyError(new Error(error));
    res.status(500).json({ message: error.message });
  }
};

const clientAnswerCreatingNewRequest = async (req, res) => {
  try {
    const previousRequest = await Request.findOne({
      _id: new ObjectId(req.body.requestId),
    });

    if (!previousRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    const coach = await Coach.findOne({
      _id: new ObjectId(previousRequest.coachId),
    });

    const newRequest = {
      coachId: previousRequest.coachId,
      serviceId: previousRequest.serviceId,
      serviceTitle: previousRequest.serviceTitle,
      email: previousRequest.email,
      name: previousRequest.name,
      type: previousRequest.type,
      priority: previousRequest.priority,
      message: req.body.message,
      state: REQUEST_STATUSES.NEW,
      isStarred: false,
      requestedDate: previousRequest.requestedDate,
      requestedTime: previousRequest.requestedTime,
    };
    await Request.create(newRequest);

    // Send email
    await sendEmailTemplate({
      recipientEmail: coach.email,
      templateId: EMAIL_TEMPLATES.CLIENT_ANSWERING_CREATING_REQUEST,
      templateVariables: {
        clientName: previousRequest.name,
        coachName: `${coach.firstName} ${coach.lastName}`,
        answer: req.body.message,
      },
    });

    res.status(200).json({
      request: newRequest,
    });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};
const answerRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: new ObjectId(req.params.requestId),
    });
    const coach = await Coach.findOne({
      _id: new ObjectId(request.coachId),
    });

    // Send email
    const clientAnswerUrl = `www.app.allwyse.io/info/${coach.slug}/services/${
      request.serviceId
    }?fromRequestId=${request._id.toString()}`;

    await sendEmailTemplate({
      recipientEmail: request.email,
      templateId: EMAIL_TEMPLATES.COACH_ANSWERING_REQUEST,
      templateVariables: {
        coachName: `${coach.firstName} ${coach.lastName}`,
        clientName: request.name,
        answer: req.body.message,
        answerUrl: clientAnswerUrl,
      },
    });

    // Update request status to ANSWERED
    await Request.updateOne(
      {
        _id: new ObjectId(req.params.requestId),
      },
      { state: REQUEST_STATUSES.ANSWERED, answer: req.body.message }
    );

    const updatedRequest = await Request.findOne({
      _id: new ObjectId(req.params.requestId),
    });

    res.status(200).json({
      request: { ...updatedRequest, state: REQUEST_STATUSES.ANSWERED },
    });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};
const getCoachRequests = async (req, res) => {
  try {
    let query = {
      type: req.query.type?.toUpperCase() || "SERVICE",
      state: {
        $in: [SEEN_REQUEST_STATUSES.NEW, SEEN_REQUEST_STATUSES.ANSWERED],
      },
    };

    if (req.query.search) {
      query = {
        ...query,
        $or: [
          { email: { $regex: req.query.search, $options: "i" } },
          { name: { $regex: req.query.search, $options: "i" } },
          { answer: { $regex: req.query.search, $options: "i" } },
          { message: { $regex: req.query.search, $options: "i" } },
        ],
      };
    }

    const matchObj = {
      coachId: new ObjectId(req.params.coachId),
      ...query,
    };

    const requests = await Request.find(matchObj);
    res.status(201).json({ requests });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: new ObjectId(req.params.requestId),
    });

    res.status(201).json({ request });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const getRequestsByServiceId = async (req, res) => {
  try {
    const requests = await Request.find({
      serviceId: new ObjectId(req.params.serviceId),
    });

    res.status(201).json({ requests });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const getCoachRequestTypes = async (req, res) => {
  try {
    const matchObj = {
      coachId: new ObjectId(req.params.coachId),
      state: REQUEST_STATUSES.NEW,
    };
    const newCoachRequestsReq = Request.find({
      ...matchObj,
      type: REQUEST_TYPES.COACH,
    }).count();
    const newServicesRequestsReq = Request.find({
      ...matchObj,
      type: REQUEST_TYPES.SERVICE,
    }).count();
    const newAppointmentRequestsReq = Request.find({
      ...matchObj,
      type: REQUEST_TYPES.APPOINTMENT,
    }).count();

    const [newCoachRequests, newServicesRequests, newAppointmentRequests] =
      await Promise.all([
        newCoachRequestsReq,
        newServicesRequestsReq,
        newAppointmentRequestsReq,
      ]);
    const labels = [
      {
        id: REQUEST_TYPES.COACH.toLowerCase(),
        name: REQUEST_TYPES.COACH.toLowerCase(),
        type: "system",
        unreadCount: newCoachRequests,
      },
      {
        id: REQUEST_TYPES.SERVICE.toLowerCase(),
        name: REQUEST_TYPES.SERVICE.toLowerCase(),
        type: "system",
        unreadCount: newServicesRequests,
      },
      {
        id: REQUEST_TYPES.APPOINTMENT.toLowerCase(),
        name: REQUEST_TYPES.APPOINTMENT.toLowerCase(),
        type: "system",
        unreadCount: newAppointmentRequests,
      },
      {
        id: REQUEST_STATUSES.ACCEPTED.toLowerCase(),
        name: REQUEST_STATUSES.ACCEPTED.toLowerCase(),
        type: "system",
        unreadCount: 0,
      },
    ];
    res.status(201).json({ labels });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const updateRequestById = async (req, res) => {
  try {
    let updatedBody = {};

    if (req.body.isStarred) {
      updatedBody = {
        ...updatedBody,
        isStarred: req.body.isStarred,
      };
    }

    if (req.body.state) {
      updatedBody = {
        ...updatedBody,
        state: req.body.state,
      };
    }

    await Request.updateOne(
      {
        _id: new ObjectId(req.params.requestId),
      },
      {
        $set: {
          ...updatedBody,
        },
      }
    );
    const request = await Request.findOne({
      _id: new ObjectId(req.params.requestId),
    });
    res.status(201).json({ request });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const confirmRequest = async (req, res) => {
  let googleError = false;
  let completionStage = "STARTED";
  try {
    const { currentRequest, currentService, currentCoach } =
      await getRequestInformation(req.params.requestId);

    // Return 404 if request doesnt exist
    if (!currentRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    completionStage = "FETCHED_INFO";

    // UPDATE REQUEST STATUS TO ACCEPTED
    await Request.updateOne(
      {
        _id: new ObjectId(req.params.requestId),
      },
      { state: REQUEST_STATUSES.ACCEPTED, answer: req.body.message }
    );
    completionStage = "UPDATED_TO_ACCEPTED";

    //CREATE CLIENT
    const client = await createClientFromRequest(currentRequest);
    completionStage = "CLIENT_CREATED";

    // create event in progress
    let events = [];

    // combine the requested time and the requested date
    const requestedTime = dayjs(currentRequest.requestedTime).format("HH:mm");
    let startDate = dayjs(currentRequest.requestedDate)
      .set("hour", requestedTime.split(":")[0])
      .set("minute", requestedTime.split(":")[1]);

    const realSessionDuration =
      currentService.sessionDuration === "Custom"
        ? currentService.customSessionMinutes
        : currentService.sessionDuration;

    let eventBody = {
      attendees: [
        {
          email: currentRequest.email,
        },
        {
          email: currentCoach.email,
        },
      ],
      coachId: currentRequest.coachId,
      color: currentService.color || "#8E33FF",
      description: `${currentService.title} : ${currentCoach.firstName} / ${currentRequest.name}`,
      start: startDate.valueOf(),
      end: startDate.valueOf() + realSessionDuration * 60 * 1000,
      startDate: startDate.toISOString(),
      sendEmail: true,
      serviceId: currentRequest.serviceId,
      sessionDuration: realSessionDuration,
      studentEmail: currentRequest.email,
      studentName: currentRequest.name,
      title: currentService.title,
      userTimeZone: currentCoach.timeZone || "America/New_York",
    };
    if (currentService.sessionPeriodicity === "one-time") {
      try {
        const googleEventInfo = await createSingleEventMethod(eventBody);
        eventBody = {
          ...eventBody,
          ...googleEventInfo,
        };
        completionStage = "GOOGLE_SINGLE_EVENT_CREATED";
      } catch (error) {
        notifyError(new Error(error));

        googleError = true;
      }

      try {
        events = await Event.create({
          ...eventBody,
          studentId: client._id,
          startDate: eventBody.startDate || new Date(eventBody.start),
          createdAt: new Date(),
          title: `${eventBody.studentName} (${eventBody.description})`,
        });
        completionStage = "SINGLE_EVENT_CREATED";
      } catch (error) {
        completionStage = "ERROR_ON_SINGLE_EVENT_CREATED";
      }
    } else {
      const recurrence = {
        startDate: startDate,
        frequency: currentService.sessionPeriodicity,
        interval: 1,
        daysOfWeek:
          currentService.sessionPeriodicity === "weekly"
            ? [getShortWeekday(startDate)]
            : null,
        endDate: currentService.endDate || getFirstDateOfNextYearISO(),
        duration: realSessionDuration * 60 * 1000,
        sessionAmount: currentService.sessionAmount || undefined,
      };

      try {
        const googleEventInfo = await createMultipleEventsMethod({
          recurrence,
          ...eventBody,
        });
        eventBody = {
          ...eventBody,
          ...googleEventInfo,
        };
        completionStage = "GOOGLE_MULTPLE_EVENT_CREATED";
      } catch (error) {
        notifyError(new Error(error));

        googleError = true;
      }
      try {
        events = await createRecurringEvents(
          {
            ...eventBody,
            studentId: client._id,
            startDate: eventBody.startDate || new Date(eventBody.start),
            createdAt: new Date(),
            title: `${eventBody.studentName} (${eventBody.description})`,
          },
          recurrence
        );
        completionStage = "MULTPLE_EVENT_CREATED";
      } catch (error) {
        completionStage = "ERROR_ON_MULTPLE_EVENT_CREATED";
      }
    }

    completionStage = "STAKE_HOLDERS_ABOUT_TO_BE_UPDATED";

    await updateRequestStakeholdersInformation({
      client,
      events,
      currentRequest,
      currentService,
      googleError,
      completionStage,
    });

    // Send email
    const clientAnswerUrl = `www.app.allwyse.io/info/${
      currentCoach.slug
    }/services/${
      currentRequest.serviceId
    }?fromRequestId=${currentRequest._id.toString()}`;
    await sendEmailTemplate({
      recipientEmail: currentRequest.email,
      templateId: EMAIL_TEMPLATES.CONFIRM_REQUEST,
      templateVariables: {
        coachName: `${currentCoach.firstName} ${currentCoach.lastName}`,
        clientName: currentRequest.name,
        answer: req.body.message,
        answerUrl: clientAnswerUrl,
      },
    });

    res.status(201).json({ message: "Request accepted", client, events });
  } catch (error) {
    notifyError(new Error(error));

    await Request.updateOne(
      {
        _id: new ObjectId(req.params.requestId),
      },
      {
        $set: {
          googleError,
          completionStage: completionStage,
          error: true,
        },
      }
    );
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createRequest,
  getCoachRequests,
  getCoachRequestTypes,
  getRequestById,
  updateRequestById,
  answerRequest,
  deleteRequest,
  clientAnswerCreatingNewRequest,
  confirmRequest,
  getRequestsByServiceId,
};
