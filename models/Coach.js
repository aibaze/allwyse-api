const mongoose = require("mongoose");
const { StudentSchema } = require("./Student");
const { ExperienceSchema } = require("./Experience");
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
      category: {
        type: String,
      },
      speciality: {
        type: String,
      },
      yof: {
        type: Number,
      },
      interestedIn: {
        type: [String],
      },

      experience: {
        type: [ExperienceSchema],
        default: [],
      },
      description: {
        type: String,
      },
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    reviews: {
      type: [String],
    },
    lastLogin: {
      type: String,
    },
    profileViews: {
      uniqueVisits: {
        type: Number,
        default: 0,
      },
      totalVisits: {
        type: Number,
        default: 0,
      },
    },
    onBoarded: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Coach = mongoose.model("Coach", CoachSchema);

module.exports = Coach;
