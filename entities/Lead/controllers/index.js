const { Lead } = require("../../../models/Lead");
const validator = require("validator");
const { notifyError } = require("../../../utils/error");
const { sendEmailTemplate, EMAIL_TEMPLATES } = require("../../../utils/email");

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
    await sendEmailTemplate({
      recipientEmail: req.body?.email,
      templateId: EMAIL_TEMPLATES.SITE_LEAD_MAGNET,
    });
    res.status(201).json({ lead: newLead });
  } catch (error) {
    notifyError(new Error(error));

    res.status(existingLead ? 400 : 500).json({ message: error.message });
  }
};

module.exports = {
  createLead,
};
