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

/* app.get('/event/coach/:coachId',async (req,res)=>{
const events = await Event.find({coachId:req.params.coachId})
res.json({events})
}) */

/* app.post("/event/create-event", async (req, res) => {
  const {attendees,userTimeZone,start,end,title,description,coachId} = req.body
  const googleInfo = await GoogleInfo.findOne({coachId:coachId}) 

  let googleError = true
  auth2Client.setCredentials({refresh_token:googleInfo?.token});

  try {
    await calendar.events.insert({
      calendarId: "primary",
      auth: auth2Client,
      conferenceDataVersion: 1,
      requestBody: {
        summary: title,
        description: description,
        start: {
          dateTime: dayjs(start),
          timeZone: userTimeZone 
        },
        end: {
          dateTime: dayjs(end),
          timeZone: userTimeZone 
        },
        conferenceData: {
          createRequest: {
            requestId: uuid(),
          },
        },
        attendees:attendees  
      },
    });
    googleError= false
    await createEvent(req,res)

  } catch (error) {
    console.log(error);

    if(googleError){
     GoogleInfo.deleteMany({coachId:coachId})
    }

    res.send({error:error.message})
  }

}); */
/* app.get("/google/authorized/:coachId",async(req,res)=>{
  const googleInfo = await GoogleInfo.findOne({coachId:req.params.coachId})
  console.log("checked")
  
  if(!googleInfo){
   return res.json({message:"Not authorized",error:"Not authorized", statusCode:403})
  }
  res.json({message:'OK',error:null})
})

app.post('/google/auth', async (req, res) => {
  const { tokens } = await auth2Client.getToken(req.body.code);
  const body = {
    token: tokens.refresh_token,
    expiresIn: tokens.expiry_date,
    coachId: req.body.coachId
  }

  await GoogleInfo.deleteMany({coachId:req.body.coachId})
  await GoogleInfo.create(body)
  console.log("auth done")
  res.json({message:"ok",error:null})
})
 */


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
