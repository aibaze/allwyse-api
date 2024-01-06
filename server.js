const express = require("express");
require("dotenv").config();
const moongose = require("mongoose");
const cors = require("cors");
const app = express();
const { coachRouter } = require("./entities/Coach/routes");
const { serviceRouter } = require("./entities/Service/routes");
const { eventRouter } = require("./entities/Event/routes");
const { google } = require("googleapis");
const { UserRefreshClient } = require("google-auth-library");
const { v4: uuid } = require("uuid");
const dayjs = require("dayjs");

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


app.post("/event/schedule", async (req, res) => {
  const {attendees,userTimeZone,startDate,endDate,title,description,code} = req.body

 if(!auth2Client.credentials.access_token){ 
  const { tokens } = await auth2Client.getToken(code);
  auth2Client.setCredentials(tokens);
  console.log(auth2Client,"despues")
 } 
    

  try {
    await calendar.events.insert({
      calendarId: "primary",
      auth: auth2Client,
      conferenceDataVersion: 1,
      requestBody: {
        summary: title,
        description: description,
        start: {
          dateTime: startDate,//dayjs().add(1, "day").toISOString(),
          timeZone: userTimeZone // "Asia/Kuala_Lumpur",
        },
        end: {
          dateTime: endDate,//dayjs().add(1, "day").add(1, "hour").toISOString(),
          timeZone: userTimeZone // "Asia/Kuala_Lumpur",
        },
        conferenceData: {
          createRequest: {
            requestId: uuid(),
          },
        },
        attendees:attendees  /* [
          { email: "bymelinaviera@gmail.com" },
          { email: "soytomasgoldenberg@gmail.com" },
        ] */
      },
    });
    res.send("done");

  } catch (error) {
    console.log(error);
    res.send({error:error.message})
  }

});

app.post('/auth/google/refresh-token', async (req, res) => {
  const user = new UserRefreshClient(
    clientId,
    clientSecret,
    req.body.refreshToken,
  );
  const { credentials } = await user.refreshAccessToken(); // optain new tokens

  res.json(credentials);
})

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
