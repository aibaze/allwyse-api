const { InternalStat } = require("../../../models/InternalStats");
const validator = require("validator");

const createStat = async (req, res) => {
  try {
    let status = 201;
    const isValidIp = validator.isIP(req.body?.ip);
    if (!isValidIp) {
      throw new Error("Invalid IP");
    }

    const existingIp = await InternalStat.findOne({ ip: req.body?.ip });
    if (existingIp) {
      status = 200;
      await InternalStat.updateOne(
        { ip: req.body?.ip },
        { $set: { ipVisitAmount: existingIp.ipVisitAmount + 1 } }
      );
    } else {
      await InternalStat.create(req.body);
    }

    res.status(status).json({ message: "OK" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStat,
};
