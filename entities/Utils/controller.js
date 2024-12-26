const { sendEmail } = require("../../utils/email");
const { executePrompt } = require("../../utils/openAI");
const { ObjectId } = require("mongodb");
const Coach = require("../../models/Coach");
const { notifyError } = require("../../utils/error");

const sendEmailController = async (req, res) => {
  try {
    await sendEmail({
      to: req.body.to,
      subject: req.body.subject,
      html: req.body.html,
    });
    res.status(200).json({ message: "OK" });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const executePromptController = async (req, res) => {
  try {
    const currentCoach = await Coach.findOne({
      _id: new ObjectId(req.body.coachId),
    });

    if (!currentCoach || currentCoach.tokens <= 0) {
      throw new Error("Not enough tokens");
    }

    const prompt = await executePrompt({
      systemPrompt: req.body.systemPrompt,
      prompt: req.body.prompt,
      maxTokens: req.body.maxTokens,
    });

    await Coach.updateOne(
      { _id: new ObjectId(req.body.coachId) },
      { $set: { tokens: currentCoach.tokens - 1 } }
    );
    res.status(200).json({ message: prompt });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendEmailController, executePromptController };
