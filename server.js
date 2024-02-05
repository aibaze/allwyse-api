const express = require("express");
require("dotenv").config();
const moongose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const app = express();

const { coachRouter } = require("./entities/Coach/routes");
const { serviceRouter } = require("./entities/Service/routes");
const { eventRouter } = require("./entities/Event/routes");
const { leadRouter } = require("./entities/Lead/routes");
const { studentRouter } = require("./entities/Student/routes");
const { suggestionRouter } = require("./entities/BetaSuggestion/routes");
const { google } = require("googleapis");

app.use(cors({credentials:true, origin:true})); // to do = imrpove cors policy
app.use(express.json());
app.options('*', cors({credentials:true, origin:true}))


/*  app.use(
  (req, res, next) => {
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
    next();
}
)  */
app.use(cookieParser());

const PORT = 4000;
const uri = process.env.DB_URI;

//ROUTES
app.use("/coach", coachRouter);
app.use("/service", serviceRouter);
app.use("/event", eventRouter);
app.use("/lead", leadRouter);
app.use("/suggestion", suggestionRouter);
app.use("/student", studentRouter);

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
