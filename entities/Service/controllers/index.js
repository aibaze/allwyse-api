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
          services: newService._id,
        },
      }
    );

    res.status(201).json({ service: newService });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createService };
