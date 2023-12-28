const { Service } = require("../../../models/Service");
const Coach = require("../../../models/Coach");
const { ObjectId } = require("mongodb");

const createService = async (req, res) => {
  try {
    const { coachId } = req.params;
    const newService = await Service.create(req.body);

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

module.exports = { createService, getServicesByCoachId,deleteService };
