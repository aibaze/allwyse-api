const { Service } = require("../../../models/Service");
const { Request } = require("../../../models/Request");
const Coach = require("../../../models/Coach");
const { Student } = require("../../../models/Student");

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
      unpaidServices: [currentRequest.serviceId],
      appointments: [],
      questionnaires: [
        {
          _id: new ObjectId(),
          questionnaire: currentRequest.questionnaire,
        },
      ],
    });
    client = await Student.findOne({
      email: currentRequest.email,
      coachId: currentRequest.coachId,
    });
  } else {
    const clientServices = client.services.map((service) => service.toString());

    const clientHasService = clientServices.includes(
      currentRequest.serviceId?.toString
    );
    const payload = clientHasService
      ? {
          questionnaires: {
            _id: new ObjectId(),
            questionnaire: currentRequest.questionnaire,
          },
        }
      : {
          services: currentRequest.serviceId,
          questionnaires: {
            _id: new ObjectId(),
            questionnaire: currentRequest.questionnaire,
          },
        };
    await Student.updateOne(
      { _id: new ObjectId(client._id) },
      {
        $push: payload,
      }
    );
  }

  return client;
};

const updateRequestStakeholdersInformation = async ({
  client,
  events,
  currentRequest,
  currentService,
  googleError,
  completionStage,
}) => {
  const isSingleEvent = events._id ? true : false;
  const eventIds = isSingleEvent ? [events._id] : events.map((e) => e._id);
  const studentQuery = Student.updateOne(
    { _id: new ObjectId(client._id) },
    {
      $set: {
        appointments: [...client.appointments, ...eventIds],
      },
    }
  );
  const coachQuery = Coach.updateOne(
    { _id: new ObjectId(currentRequest.coachId) },
    {
      $push: {
        students: client._id,
      },
    }
  );
  const serviceQuery = Service.updateOne(
    { _id: new ObjectId(currentRequest.serviceId) },
    {
      $set: {
        seatsLeft: currentService.seatsLeft - 1,
      },
    }
  );
  const requestQuery = Request.updateOne(
    {
      _id: new ObjectId(currentRequest._id),
    },
    {
      $set: {
        googleError,
        completionStage: completionStage,
      },
    }
  );
  const promises = [studentQuery, coachQuery, serviceQuery, requestQuery];
  await Promise.all(promises);
};

module.exports = {
  getRequestInformation,
  updateRequestStakeholdersInformation,
  createClientFromRequest,
};
