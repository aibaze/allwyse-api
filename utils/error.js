const Bugsnag = require("@bugsnag/js");

const notifyError = (error) => {
  Bugsnag.notify(error);
};

module.exports = { notifyError };
