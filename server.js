const express = require("express");
require("dotenv").config();
const moongose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

const { coachRouter } = require("./entities/Coach/routes");
const { serviceRouter } = require("./entities/Service/routes");
const { eventRouter } = require("./entities/Event/routes");
const { leadRouter } = require("./entities/Lead/routes");
const { studentRouter } = require("./entities/Student/routes");
const { bugReportRouter } = require("./entities/BugReport/routes");
const { requestRouter } = require("./entities/Request/routes");
const { internalStatRouter } = require("./entities/InternalStats/routes");
const { postRouter } = require("./entities/Post/routes");

app.use(cors({ credentials: true, origin: true })); // to do = imrpove cors policy
app.use(express.json());
app.options("*", cors({ credentials: true, origin: true }));
app.use(cookieParser());

const PORT = 4000;
const uri = process.env.DB_URI;

//ROUTES
app.use("/coach", coachRouter);
app.use("/service", serviceRouter);
app.use("/event", eventRouter);
app.use("/student", studentRouter);
app.use("/request", requestRouter);

app.use("/lead", leadRouter);
app.use("/bug-report", bugReportRouter);
app.use("/internal-stat", internalStatRouter);
app.use("/post", postRouter);

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
