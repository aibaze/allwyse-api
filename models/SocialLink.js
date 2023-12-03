const mongoose = require("mongoose")

const SocialLinkSchema = mongoose.Schema(
    {
        url:{
            type: String,
        },
        label:{
            type: String,
        },
    }
)

module.exports = {SocialLinkSchema}