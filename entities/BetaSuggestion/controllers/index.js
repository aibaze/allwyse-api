const { BetaSuggestion } = require("../../../models/BetaSuggestion");

const createSuggestion = async (req, res) => {
  try {
    await BetaSuggestion.create(req.body);
    res.status(201).json({ message: "ok" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSuggestion,
};
