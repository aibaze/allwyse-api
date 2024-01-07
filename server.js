const express = require("express");
require("dotenv").config();
const moongose = require("mongoose");
const cors = require("cors");
const app = express();

const { coachRouter } = require("./entities/Coach/routes");
const { serviceRouter } = require("./entities/Service/routes");
const { eventRouter } = require("./entities/Event/routes");
const { google } = require("googleapis");
const { v4: uuid } = require("uuid");
const dayjs = require("dayjs");
const {GoogleInfo} = require("./models/GoogleInfo")
const {Event} = require("./models/Event")
const {createEvent} = require("./entities/Event/controllers")

app.use(cors());
app.use(express.json());

const PORT = 4000;
const uri =process.env.DB_URI;

const auth2Client = new google.auth.OAuth2(
  process.env.CALENAR_CLIENT_KEY,
  process.env.CALENDAR_CLIENT_SECRET,
"postmessage"

);
const calendar = google.calendar({
  version: "v3",
  auth: process.env.CALENDAR_API_KEY,
});
const scopes = ["https://www.googleapis.com/auth/calendar"];
//ROUTES
app.use("/coach", coachRouter);
app.use("/service", serviceRouter);
app.use("/event", eventRouter);




moongose
  .connect(uri)
  .then((res) => {
    console.log("DB CONNECTED");
    app.listen(PORT, () => {
      console.log("Listening on port " + PORT);
    });
  })
  .catch((e) => console.log(e));

/* sheell

mongosh "mongodb+srv://globalu.spsgfxv.mongodb.net/" --apiVersion 1 --username bymelinaviera
*/
