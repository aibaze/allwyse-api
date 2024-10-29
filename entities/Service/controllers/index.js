const { Service } = require("../../../models/Service");
const Coach = require("../../../models/Coach");
const { ObjectId } = require("mongodb");

const createService = async (req, res) => {
  try {
    const { coachId } = req.params;
    const newService = await Service.create({
      ...req.body,
      coachId,
      totalSeats: req.body.seatsLeft,
    });

    await Coach.updateOne(
      { _id: new ObjectId(coachId) },
      {
        $push: {
          services: new ObjectId(newService._id),
        },
      }
    );

    res.status(201).json({ service: newService });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateServiceViews = async (req, res) => {
  try {
    const { serviceId } = req.params;

    await Service.updateOne(
      { _id: new ObjectId(serviceId) },
      {
        $set: {
          views: req.body.views,
        },
      }
    );

    const service = await Service.findOne({ _id: new ObjectId(serviceId) });

    res.status(200).json({ service });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const email = req.loggedUser.email || req.loggedUser;
    const { serviceId } = req.params;

    const coachReq = Coach.findOne({ email });
    const serviceReq = Service.findOne({ _id: new ObjectId(serviceId) });
    const [coach, service] = await Promise.all([coachReq, serviceReq]);

    if (!coach || !service) {
      return res.status(404).json({ message: "Not found" });
    }

    if (coach?._id?.toString() !== service.coachId?.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    let updatingPayload = req.body;

    if (req.body.totalSeats) {
      const addedSeats = req.body.totalSeats - service.totalSeats;
      updatingPayload = {
        ...req.body,
        totalSeats: req.body.totalSeats,
        seatsLeft: service.seatsLeft + addedSeats,
      };
    }

    const updatedService = await Service.updateOne(
      { _id: new ObjectId(serviceId) },
      { $set: updatingPayload }
    );

    res.status(200).json({ service: updatedService });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;

    await Service.updateOne(
      { _id: new ObjectId(serviceId) },
      {
        $push: {
          reviews: req.body.newReview,
        },
      }
    );

    const service = await Service.findOne({ _id: new ObjectId(serviceId) });

    res.status(200).json({ service });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findOne({
      _id: new ObjectId(serviceId),
    });

    res.status(200).json({ service: service });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const { coachId, serviceId } = req.params;
    await Service.deleteOne({ _id: new ObjectId(serviceId) });

    await Coach.updateOne(
      {
        _id: new ObjectId(coachId),
        services: { $in: [new ObjectId(serviceId)] },
      },
      {
        $pull: {
          services: new ObjectId(serviceId),
        },
      }
    );

    res.status(200).json({ message: "Delete successfull" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getServicesByCoachId = async (req, res) => {
  try {
    const { coachId } = req.params;

    const coachServices =
      (await Coach.findOne({ _id: new ObjectId(coachId) }).lean()) || [];
    const services = await Service.find({
      _id: { $in: coachServices.services },
    });

    res.status(201).json({ services });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getServiceStats = async (req, res) => {
  try {
    const coachId = new ObjectId(req.params.coachId);
    const services = await Service.find({ _id: coachId }).lean();
    let stats = {
      uniqueVisits: 0,
      totalVisits: 0,
    };

    services.forEach((service) => {
      stats = {
        uniqueVisits: stats.uniqueVisits + service.profileViews.uniqueVisits,
        totalVisits: stats.totalVisits + service.profileViews.totalVisits,
      };
    });
    res.status(200).json({ ...stats });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createService,
  getServicesByCoachId,
  deleteService,
  updateService,
  getServiceStats,
  getServiceById,
  updateServiceReviews,
  updateServiceViews,
};
