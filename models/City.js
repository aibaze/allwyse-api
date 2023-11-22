const mongoose = require("mongoose")



const CommonObject = mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"]
    },
    property:{
        type: String,
        required: [true, "Property price is required"]
    },
    value:{
        type: String,
    },
})



const CitySchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: [true, "City name is required"]
        },
        overallCost:{
            type: Number,
            required: [true, "overallCost is required"]
        },
        internetSpeed:{
            type: Number,
            required: [true, "internetSpeed is required"]
        },
        weather:{
            type: Number,
            required: [true, "weather is required"]
        },
        avoidZones: {
            type : [String],
            required: [true, "avoidZones is required"]

        },
        recommendedZones: {
            type : [String],
            required: [true, "recommendedZones is required"]
        },
        niceToKnow: {
            type : [String],
            required: [true, "niceToKnow is required"]
        },
        airQuality:{
            type: String,
            required: [true, "airQuality is required"]
        },
        etnicity:{
            type: String,
            required: [true, "etnicity is required"]
        },
        currency:{
            type: String,
            required: [true, "currency is required"]
        },
        incomeLevel:{
            type: String,
            required: [true, "incomeLevel is required"]
        },
        englishSpeaking:{
            type: String,
            required: [true, "englishSpeaking is required"]
        },
        trafficSafety:{
            type: String,
            required: [true, "trafficSafety is required"]
        },
        healthCenter:{
            type: String,
            required: [true, "healthCenter is required"]
        },
        nightLife:{
            type: [String],
            required: [true, "nightLife is required"]
        },
        soloFemale:{
            type: String,
            required: [true, "soloFemale is required"]
        },
        lgbtq:{
            type: String,
            required: [true, "lgbtq is required"]
        },
        continent:{
            type: String,
            required: [true, "continent is required"]
        },
        neighborhood:{
            type: String,
            required: [true, "neighborhood is required"]
        },
        currencyToUsd:{
            type: String,
            required: [true, "currencyToUsd is required"]
        },
        coWorks:{
            type: [String],
            required: [true, "coWorks is required"]
        },
        coffeShops:{
            type: [String],
            required: [true, "coffeShops is required"]
        },
        tapWater:{
            type: Boolean,
            required: [true, "tapWater is required"]
        },
        population:{
            type: String,
            required: [true, "population is required"]
        },
        power:{
            type: String,
            required: [true, "power is required"]
        },
        bestSeason:{
            type: String,
            required: [true, "bestSeason is required"]
        },
        eSim:{
            type: String,
            required: [true, "eSim is required"]
        },
        visa:{
            type: [String],
            required: [true, "visa is required"]
        },
        donts:{
            type: [String],
            required: [true, "donts is required"]
        },
        religion:{
            type: String,
            required: [true, "religion is required"]
        },
        socialMediaAbout:{
            type: [CommonObject],
            required: [true, "socialMediaAbout is required"]
        },
        airbnbs:{
            type: [String],
            required: [true, "airbnbs is required"]
        },
        activities:{
            type: [CommonObject], // add schema
            required: [true, "activities is required"]
        },
    },
    {
        timestamps: true
    }
)

const City = mongoose.model("City", CitySchema)

module.exports = City