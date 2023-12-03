const express = require("express")
const moongose = require("mongoose")
const {ObjectId} = require("mongodb")
const Coach = require("./models/Coach")
const cors = require("cors")
const app = express()

app.use(cors())
app.use(express.json())

const PORT = 4000
const uri = 'mongodb+srv://bymelinaviera:bymelinaviera@globalu.spsgfxv.mongodb.net/cities?retryWrites=true&w=majority'

//ROUTES
app.post("/create-coach",async (req,res)=>{
   try {
    const coach = await Coach.create({...req.body})
    res.status(201).json({coach})
   } catch (error) {
    console.log(error.message)
    res.status(500).json({message:error.message})
   }
})

app.put("/update-coach/:id",async (req,res)=>{
    try {
      const coachId = new ObjectId(req.params.id)
      const payload = req.body
      let updatedBody = {}

      if (payload.categories) {
         updatedBody['profileInfo.categories'] = payload.categories;
       }

       if (payload.languages) {
         updatedBody['profileInfo.languages'] = payload.languages;
       }

       if (payload.location) {
         updatedBody['profileInfo.location'] = payload.location;
       }


       if (payload.shortDescription) {
         updatedBody['profileInfo.shortDescription'] = payload.shortDescription;
       }


      await Coach.updateOne({_id: coachId},{$set:updatedBody})
      const coach = await Coach.findOne({_id: coachId})
      res.status(201).json({coach})
    } catch (error) {
     console.log(error.message)
     res.status(500).json({message:error.message})
    }
 })

app.get("/coach/:id",async (req,res)=>{
    try {
     const isEmail = req.params.id.includes("@")
     const query = isEmail ? {"email":req.params.id } : {_id: new ObjectId(req.params.id)}
     const coach = await Coach.findOne(query).lean()
     res.status(200).json({...coach})
    } catch (error) {
     console.log(error.message)
     res.status(500).json({message:error.message})
    }
 })

 app.delete("/coach/:id",async (req,res)=>{
    try {
     const isEmail = req.params.id.includes("@")
     const query = isEmail ? {"email":req.params.id } : {_id: new ObjectId(req.params.id)}
     const coach = await Coach.findOne(query).lean()
     if(!coach){
        res.status(400).json({message:"not found"})
     }
     await Coach.deleteOne(query)
     res.status(200).json({message:"deleted"})
    } catch (error) {
     console.log(error.message)
     res.status(500).json({message:error.message})
    }
 })

moongose.connect(uri)
.then((res)=>{
    console.log("DB CONNECTED");
    app.listen(PORT, ()=>{ console.log("Listening on port " + PORT) })
})
.catch(e=>console.log(e))


/* sheell

mongosh "mongodb+srv://globalu.spsgfxv.mongodb.net/" --apiVersion 1 --username bymelinaviera
*/