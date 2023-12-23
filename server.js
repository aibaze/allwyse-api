const express = require("express");
const moongose = require("mongoose");
const cors = require("cors");
const app = express();
const {
coachRouter
} = require("./entities/Coach/routes");
const {
  serviceRouter
  } = require("./entities/Service/routes");

app.use(cors());
app.use(express.json());

const PORT = 4000;
const uri =
  "mongodb+srv://bymelinaviera:bymelinaviera@globalu.spsgfxv.mongodb.net/cities?retryWrites=true&w=majority";

//ROUTES
app.use('/coach',coachRouter)
app.use('/service',serviceRouter)

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
