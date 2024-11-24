const mongoose = require("mongoose");
const { ReviewSchema } = require("./Review");
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
      education: {
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
      brandName: {
        type: String,
      },
      brandRole: {
        type: String,
      },
      shouldShowBrand: {
        type: Boolean,
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
      type: [ReviewSchema],
      default: [],
    },
    lastLogin: {
      type: String,
    },
    SSO: {
      type: String,
    },
    timeZone: {
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
    subscriptionInfo: {
      cutoff: {
        type: String,
      },
      type: {
        type: String,
      },
      startDate: {
        type: String,
      },
      paymentMethod: {
        type: String,
      },
    },
    onBoarded: {
      type: Boolean,
    },
    tokens: {
      type: Number,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

const Coach = mongoose.model("Coach", CoachSchema);

module.exports = Coach;
