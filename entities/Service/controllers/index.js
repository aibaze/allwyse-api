const { Service } = require("../../../models/Service");
const Coach = require("../../../models/Coach");
const { ObjectId } = require("mongodb");

const createService = async (req, res) => {
  try {
    const { coachId } = req.params;
    const newService = await Service.create({ ...req.body, coachId });

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
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const updatedService = await Service.updateOne(
      { _id: new ObjectId(serviceId) },
      { $set: req.body }
    );

    res.status(200).json({ service: updatedService });
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

const logNewView = async (req, res) => {
  try {
    const isFirstVisit = req.body.firstVisit;
    const serviceId = new ObjectId(req.body.serviceId);
    const currentService = await Service.findOne({ _id: serviceId });

    const body = {
      uniqueVisits: isFirstVisit
        ? currentService.profileViews.uniqueVisits + 1
        : currentService.profileViews.uniqueVisits,
      totalVisits: currentService.profileViews.totalVisits + 1,
    };

    await Service.updateOne(
      { _id: coachId },
      {
        profileViews: body,
      }
    );

    res.status(201).json({ message: "OK" });
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
  logNewView,
  getServiceStats,
};
