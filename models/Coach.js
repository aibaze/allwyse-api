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
      default: 20,
    },
    subscription: {
      subscribed: {
        type: Boolean,
        default: false,
      },
      coupon: {
        type: String,
        default: null,
      },
      createdAt: {
        type: Date,
        default: null,
      },
      cutoff: {
        type: Date,
        default: null,
      },
      priceId: {
        type: String,
        default: null,
      },
      recurrence: {
        type: String,
        default: null,
      },
      amountInCents: {
        type: Number,
        default: null,
      },
      productId: {
        type: String,
        default: null,
      },
      productName: {
        type: String,
        default: null,
      },
      stripeId: {
        type: String,
        default: null,
      },
      trialEnd: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Coach = mongoose.model("Coach", CoachSchema);

module.exports = Coach;
