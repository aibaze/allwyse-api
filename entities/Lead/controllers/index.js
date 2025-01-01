const { Lead } = require("../../../models/Lead");
const validator = require("validator");
const { notifyError } = require("../../../utils/error");

const createLead = async (req, res) => {
  let existingLead = undefined;
  try {
    const isValidEmail = validator.isEmail(req.body?.email);
    if (!isValidEmail) {
      throw new Error("Invalid email");
    }
    existingLead = await Lead.findOne({ email: req.body.email });
    if (existingLead) {
      throw new Error("This email is already suscribed.");
    }

    const newLead = await Lead.create(req.body);
    res.status(201).json({ lead: newLead });
  } catch (error) {
    notifyError(new Error(error));

    res.status(existingLead ? 400 : 500).json({ message: error.message });
  }
};

module.exports = {
  createLead,
};
