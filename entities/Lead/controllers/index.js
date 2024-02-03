const { Lead } = require("../../../models/Lead");

const createLead = async (req, res) => {
  try {
    const newLead = await Lead.create(req.body);

    res.status(201).json({ lead: newLead });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLead,
};
