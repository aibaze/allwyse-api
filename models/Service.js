const mongoose = require("mongoose")

const ServiceSchema = mongoose.Schema(
    {
        title:{
            type: String,
        },
        slug:{
            type: String,
        },
        shortDescription:{
            type: String,
        },
        description:{
            type: String,
        },
        type:{
            type: String, /* hourly | course | other */
        },
        price:{
            type: String, /* ? */
        },
        image:{
            type: String, /* ? */
        },
        studentAmount:{
            type: String, /* ? */
        },
        studentTarget:{
            type: String, /* ? */
        },
        studentBenefits:{
            type: String, /* ? */
        },
        advertisingUrl:{
            type: String, /* ? */
        }
    }
)

module.exports = {ServiceSchema}