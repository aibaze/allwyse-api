const { InternalStat } = require("../../../models/InternalStats");
const validator = require("validator");

const createStat = async (req, res) => {
  console.log("received", req.body);
  try {
    let status = 201;
    const isValidIp = validator.isIP(req.body?.ip);
    if (!isValidIp) {
      throw new Error("Invalid IP");
    }

    const existingIp = await InternalStat.findOne({ ip: req.body?.ip });
    console.log(existingIp, "existingIp");
    if (existingIp) {
      status = 200;
      await InternalStat.updateOne(
        { ip: req.body?.ip },
        { $set: { ipVisitAmount: existingIp.ipVisitAmount + 1 } }
      );
    } else {
      await InternalStat.create(req.body);
    }
    res.setHeader("Cache-Control", "no-store");

    res.status(status).json({ message: "OK" });
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await InternalStat.find();
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(stats);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStat,
  getStats,
};
