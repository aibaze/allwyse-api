const mongoose = require("mongoose")

const CategorySchema = mongoose.Schema(
    {
        name:{
            type: String,
        },
        yof:String,
        subCategories:[String]
    }
)

module.exports = {CategorySchema}
