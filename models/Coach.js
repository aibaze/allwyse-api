const mongoose = require("mongoose");
const { StudentSchema } = require("./Student");
const { CategorySchema } = require("./Category");
const { SocialLinkSchema } = require("./SocialLink");

const CoachSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    slug: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email  is required"],
    },
    availabilityFrom: {
      type: String,
    },
    availabilityTo: {
      type: String,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    profileInfo: {
      profileImg: {
        type: String,
      },
      professionalImg: {
        type: String,
      },
      socialLinks: {
        type: [SocialLinkSchema],
      },
      shortDescription: {
        type: String,
      },
      studies: {
        type: String,
      },
      languages: {
        type: [String],
      },
      location: {
        type: String,
      },
      categories: {
        type: [CategorySchema],
        default: [],
      },
      description: {
        type: String,
      },
    },
    students:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    reviews:{
      type:{String} // to do create a schema for reviews
    }
  },
  {
    timestamps: true,
  }
);

const Coach = mongoose.model("Coach", CoachSchema);

module.exports = Coach;
