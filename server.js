const express = require("express")
const app = express()
const PORT = 4000

//ROUTES
app.get("/",(req,res)=>{
    res.json({ok:"yes"})
})

app.listen(PORT, ()=>{
    console.log("listen on port " + PORT)
})