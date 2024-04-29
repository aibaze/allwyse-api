const { BugReport } = require("../../../models/BugReport");
const validator = require("validator");

const createReport = async (req, res) => {
  try {
    const isValidEmail = validator.isEmail(req.body?.email);
    if (!isValidEmail) {
      throw new Error("Invalid email");
    }
    await BugReport.create(req.body);
    res.status(201).json({ message: "ok" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
};
