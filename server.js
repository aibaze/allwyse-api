const express = require("express")
const moongose = require("mongoose")
const City = require("./models/City")
const app = express()

app.use(express.json())

const PORT = 4000
const uri = 'mongodb+srv://bymelinaviera:bymelinaviera@globalu.spsgfxv.mongodb.net/cities?retryWrites=true&w=majority'

//ROUTES
app.post("/create-city",async (req,res)=>{
   try {
    const city = await City.create({...req.body})
   res.status(201).json({city})
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