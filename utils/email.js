const { MailtrapClient } = require("mailtrap");

const EMAIL_TEMPLATES = {
  COACH_ANSWERING_REQUEST: "9940c366-8bff-4041-8937-9be9d13266f5",
  CLIENT_ANSWERING_CREATING_REQUEST: "8b51a8b0-84ae-44c0-873b-76d8cc113825",
  CONFIRM_REQUEST: "e88c7558-0644-47f4-ad75-7c58ee682163",
};

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

const sendEmailTemplate = async (options) => {
  const TOKEN = process.env.EMAIL_API_KEY;
  const emailClient = new MailtrapClient({ token: TOKEN });

  const sender = {
    email: "info@allwyse.io",
    name: "Allwyse",
  };
  const recipients = [
    {
      email: options.recipientEmail,
    },
  ];
  if (!process.env.EMAIL_API_KEY) {
    throw new Error("Email API key is required");
  }
  if (!options.templateId) {
    throw new Error("Template id is required");
  }

  await emailClient.send({
    from: sender,
    to: recipients,
    template_uuid: options.templateId,
    template_variables: options.templateVariables,
  });
};

module.exports = {
  sendEmail,
  sendEmailTemplate,
  EMAIL_TEMPLATES,
};
