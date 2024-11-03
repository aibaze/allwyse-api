const { MailtrapClient } = require("mailtrap");

const sendEmail = async (options) => {
  const TOKEN = process.env.EMAIL_API_KEY;
  const emailClient = new MailtrapClient({ token: TOKEN });

  if (!options.to) {
    throw new Error("Email recipient is required");
  }
  if (!options.subject) {
    throw new Error("Email subject is required");
  }
  if (!options.html) {
    throw new Error("Email content is required");
  }
  if (!process.env.EMAIL_API_KEY) {
    throw new Error("Email API key is required");
  }

  await emailClient.send({
    from: { email: options.sender || "info@allwyse.io" },
    to: [{ email: options.to }],
    subject: options.subject,
    html: options.html,
  });
};

module.exports = {
  sendEmail,
};
