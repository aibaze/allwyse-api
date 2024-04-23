const { BugReport } = require("../../../models/BugReport");

const createReport = async (req, res) => {
  try {
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
