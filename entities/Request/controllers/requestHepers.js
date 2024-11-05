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
  events,
  currentRequest,
  currentService,
}) => {
  const isSingleEvent = events._id ? true : false;
  const eventIds = isSingleEvent ? [events._id] : events.map((e) => e._id);
  await Student.updateOne(
    { _id: new ObjectId(client._id) },
    {
      $set: {
        appointments: [...client.appointments, ...eventIds],
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

module.exports = {
  getRequestInformation,
  updateRequestStakeholdersInformation,
  createClientFromRequest,
};
