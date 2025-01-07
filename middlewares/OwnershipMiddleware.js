const Coach = require("../models/Coach");
const { notifyError } = require("../utils/error");

const OwnershipVerification = async (req, res, next) => {
  try {
    const email = req.loggedUser.email || req.loggedUser;
    const coachId = req.params.id || req.params.coachId;
    const currentCoach = await Coach.findOne({ email });

    if (!currentCoach || !coachId) {
      throw new Error("Coach not found");
    }

    const matchId = currentCoach._id.toString() !== coachId?.toString();
    const matchEmail = currentCoach.email.toString() !== coachId?.toString();

    if (matchId && matchEmail) {
      notifyError(new Error(`${email} is not the owner of this resource`));
      throw new Error("Forbidden");
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: true, message: "Forbidden" });
  }
};
module.exports = OwnershipVerification;
