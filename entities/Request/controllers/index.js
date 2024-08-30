const { Request } = require("../../../models/Request");
const { ObjectId } = require("mongodb");
const {
  REQUEST_STATUSES,
  REQUEST_TYPES,
  SEEN_REQUEST_STATUSES,
} = require("../../../constants");
const { MailtrapClient } = require("mailtrap");
const Coach = require("../../../models/Coach");
const { Service } = require("../../../models/Service");

const createRequest = async (req, res) => {
  try {
    let payload = req.body;
    if (payload.serviceId) {
      const service = await Service.findOne({
        _id: new ObjectId(payload.serviceId),
      });
      payload = {
        ...payload,
        serviceTitle: service.title,
      };
    }
    const request = await Request.create(req.body);
    res.status(201).json({ request });
  } catch (error) {
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
    const TOKEN = process.env.EMAIL_API_KEY;
    const client = new MailtrapClient({ token: TOKEN });
    await client.send({
      from: { email: "info@allwyse.io" },
      to: [{ email: request.email }],
      subject: `Hello ${request.name},Here is the answer of your request for ${coach.firstName} ${coach.lastName}  !`,
      html: `${req.body.message} <br/> <p>To keep chating with ${coach.firstName} ${coach.lastName} in its plaform, create a free account here</p>`,
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
    res.status(500).json({ message: error.message });
  }
};
const getCoachRequests = async (req, res) => {
  try {
    const query =
      req.query.type === "accepted"
        ? { state: REQUEST_STATUSES.ACCEPTED }
        : {
            type: req.query.type?.toUpperCase(),
            state: {
              $in: [
                SEEN_REQUEST_STATUSES.NEW,
                SEEN_REQUEST_STATUSES.READ,
                SEEN_REQUEST_STATUSES.ANSWERED,
              ],
            },
          };
    const matchObj = req.query.type
      ? {
          coachId: new ObjectId(req.params.coachId),
          ...query,
        }
      : {
          coachId: new ObjectId(req.params.coachId),
        };

    const requests = await Request.find(matchObj);
    res.status(201).json({ requests });
  } catch (error) {
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
};
