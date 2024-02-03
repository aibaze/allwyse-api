const { Lead } = require("../../../models/Lead");

const createLead = async (req, res) => {
  try {

    const existingLead = await Lead.findOne({"email":req.body.email})
    if(existingLead){
      res.status(400).json({ message: "This email is already submitted for our beta" });
    }


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
