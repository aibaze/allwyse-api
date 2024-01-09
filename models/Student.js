const mongoose = require("mongoose")

const StudentSchema = mongoose.Schema(
    {
        firstName:{
            type: String,
            required: [true, "First name is required"]
        },
        lastName:{
            type: String,
            required: [true, "Last name is required"]
        },
        email:{
            type: String,
            required: [true, "Email  is required"]
        },
    }
)

module.exports = {StudentSchema}