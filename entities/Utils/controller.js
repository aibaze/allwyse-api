const { sendEmail } = require("../../utils/email");

const sendEmailController = async (req, res) => {
  try {
    await sendEmail({
      to: req.body.to,
      subject: req.body.subject,
      html: req.body.html,
    });
    res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendEmailController };
