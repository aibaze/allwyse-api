const { MailtrapClient } = require("mailtrap");
const { convertHtmlToText } = require("./format");

const EMAIL_TEMPLATES = {
  COACH_ANSWERING_REQUEST: "9940c366-8bff-4041-8937-9be9d13266f5",
  CLIENT_ANSWERING_CREATING_REQUEST: "8b51a8b0-84ae-44c0-873b-76d8cc113825",
  CONFIRM_REQUEST: "e88c7558-0644-47f4-ad75-7c58ee682163",
  CREATED_REQUEST: "d586749a-d733-4a3a-b191-58c6e3daed96",
  ONBOARDING: "875494a3-ff2c-4a0f-ac88-4929bab9f2e1",
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

  let variables = options.templateVariables;
  if (!variables) {
    variables = {};
  }

  if (variables.message) {
    variables.message = convertHtmlToText(variables.message, variables.message);
  }

  if (variables.answer) {
    variables.answer = convertHtmlToText(variables.answer, variables.answer);
  }

  await emailClient.send({
    from: sender,
    to: recipients,
    template_uuid: options.templateId,
    template_variables: variables,
  });
};

module.exports = {
  sendEmail,
  sendEmailTemplate,
  EMAIL_TEMPLATES,
};
