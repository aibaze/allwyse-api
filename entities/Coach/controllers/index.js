const { ObjectId } = require("mongodb");
const Coach = require("../../../models/Coach");
const { Service } = require("../../../models/Service");
const { Event } = require("../../../models/Event");
const { Student } = require("../../../models/Student");
const { executePrompt } = require("../../../utils/openAI");
const cookie = require("cookie");
const { getCurrentWeek, getCurrentDayBounds } = require("../../../utils/date");
const { getPercentage } = require("../../../utils/format");
const { getStartAndEndOfCurrentMonth } = require("../../../utils/date");
const { OAuth2Client } = require("google-auth-library");
const { notifyError } = require("../../../utils/error");
const { sendEmailTemplate, EMAIL_TEMPLATES } = require("../../../utils/email");
const googleClient = new OAuth2Client();

function formatExperienceForPrompt(experienceArray) {
  if (!Array.isArray(experienceArray) || experienceArray.length === 0) {
    return "No experience data available.";
  }

  return experienceArray
    .map((exp) => {
      const expertise = exp.expertise || "Unknown expertise";
      const brand = exp.brand || "Unknown brand";
      const year = exp.year || "Unknown year";

      return `- In ${year}, worked at "${brand}" with expertise in "${expertise}".`;
    })
    .join("\n");
}

const handleOnboardUser = async (coachId, onboardingData) => {
  const currentCoach = await Coach.findOne({ _id: coachId }).lean();

  sendEmailTemplate({
    recipientEmail: currentCoach.email,
    templateId: EMAIL_TEMPLATES.ONBOARDING,
    templateVariables: {
      name: `${currentCoach.firstName} ${currentCoach.lastName}`,
    },
  });

  let fineTunedDescription = "";
  try {
    fineTunedDescription = await executePrompt({
      systemPrompt: `You are a specialist in copywriting, and you will write a professional description`,
      prompt: `I am a ${onboardingData.category} coach. My specialty is ${
        onboardingData.speciality
      }, and I have worked since ${onboardingData.yof} in ${
        onboardingData.category
      }, my experience is ${formatExperienceForPrompt(
        onboardingData.experience
      )}. Return this wrapped in a <p> tag and it should fit in 120 token`,
      maxTokens: 120,
    });
  } catch (error) {
    fineTunedDescription = "";
  }

  return fineTunedDescription;
};

function slugify(name) {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

const handleUniqueSlug = async (existingSlug) => {
  let number = 1;
  let validSlug = "";

  while (!validSlug) {
    const newSlug = `${existingSlug}${number}`;
    const slugInDb = await Coach.findOne({ slug: newSlug });

    if (!slugInDb) {
      validSlug = newSlug;
      return newSlug;
    } else {
      number++;
    }
  }
  return validSlug;
};

const createSlug = (firstName, lastName) => {
  const slug = `${slugify(firstName)}-${slugify(lastName)}`;
  return slug;
};

const handleGoogleSSO = async (authorizationHeader) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: authorizationHeader,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  return {
    email: payload.email,
    firstName: payload.given_name || payload.email || "",
    lastName: payload.family_name || "",
    SSO: "GOOGLE",
    profileInfo: {
      profileImg: payload.picture,
    },
  };
};

const checkSSOToken = async (req, res) => {
  try {
    const authorizationHeader = req.body.x_auth_token_sso;
    const ticket = await googleClient.verifyIdToken({
      idToken: authorizationHeader,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    let minute = 60 * 1000;
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token_sso", authorizationHeader, {
        httpOnly: true,
        maxAge: minute * 60,
        path: "/",
        sameSite: "none",
      })
    );
    res.status(200).json({ email: payload.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCoach = async (req, res) => {
  let reqBody = req.body;
  try {
    if (reqBody.SSO === "GOOGLE") {
      const authorizationHeader = req.header("x_auth_token_sso")
        ? req.header("x_auth_token_sso")
        : req.cookies.x_auth_token_sso;
      reqBody = await handleGoogleSSO(authorizationHeader);
    }
    const existingCoach = await Coach.findOne({ email: reqBody.email });
    if (existingCoach) {
      throw new Error(
        `Another account with ${reqBody.email} email has already been taken !`
      );
    }

    let slug = createSlug(
      reqBody.firstName || reqBody.email || "",
      reqBody.lastName || ""
    );
    const existingSlug = await Coach.findOne({ slug });
    if (existingSlug) {
      slug = await handleUniqueSlug(slug);
    }
    const body = {
      ...reqBody,
      slug,
    };
    const coach = await Coach.create(body);

    res.status(201).json({ coach });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const updateCoach = async (req, res) => {
  try {
    const coachId = new ObjectId(req.params.id);
    const payload = req.body;
    let updatedBody = {};

    if (payload.category) {
      updatedBody["profileInfo.category"] = payload.category;
    }
    if (payload.speciality) {
      updatedBody["profileInfo.speciality"] = payload.speciality;
    }
    if (payload.yof) {
      updatedBody["profileInfo.yof"] = payload.yof;
    }
    if (payload.interestedIn) {
      updatedBody["profileInfo.interestedIn"] = payload.interestedIn;
    }
    if (payload.experience) {
      updatedBody["profileInfo.experience"] = payload.experience;
    }

    if (payload.onBoarded) {
      updatedBody["onBoarded"] = payload.onBoarded;
      const fineTunedDescription = await handleOnboardUser(coachId, {
        category: payload.category,
        speciality: payload.speciality,
        yof: payload.yof,
        experience: payload.experience,
      });

      updatedBody["profileInfo.description"] = fineTunedDescription;
    }

    if (payload.languages) {
      updatedBody["profileInfo.languages"] = payload.languages;
    }

    if (payload.location) {
      updatedBody["profileInfo.location"] = payload.location;
    }
    if (payload.socialLinks) {
      updatedBody["profileInfo.socialLinks"] = payload.socialLinks;
    }
    if (payload.brandName) {
      updatedBody["profileInfo.brandName"] = payload.brandName;
    }
    if (payload.brandRole) {
      updatedBody["profileInfo.brandRole"] = payload.brandRole;
    }
    if (payload.shouldShowBrand) {
      updatedBody["profileInfo.shouldShowBrand"] = payload.shouldShowBrand;
    }
    if (payload.education) {
      updatedBody["profileInfo.education"] = payload.education;
    }

    if (payload.shortDescription) {
      updatedBody["profileInfo.shortDescription"] = payload.shortDescription;
    }

    if (payload.description) {
      updatedBody["profileInfo.description"] = payload.description;
    }

    if (payload.studies) {
      updatedBody["profileInfo.studies"] = payload.studies;
    }

    if (payload.profileImg) {
      updatedBody["profileInfo.profileImg"] = payload.profileImg;
    }

    if (payload.professionalImg) {
      updatedBody["profileInfo.professionalImg"] = payload.professionalImg;
    }

    if (payload.timeZone) {
      updatedBody["timeZone"] = payload.timeZone;
    }

    if (payload.firstName) {
      updatedBody["firstName"] = payload.firstName;
    }

    if (payload.lastName) {
      updatedBody["lastName"] = payload.lastName;
    }

    await Coach.updateOne({ _id: coachId }, { $set: updatedBody });
    const coach = await Coach.findOne({ _id: coachId }).lean();
    res.status(201).json({ ...coach });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const getCoach = async (req, res) => {
  try {
    const isEmail =
      req.params.id.includes("@") || req.params.id.includes(".com");
    const query = isEmail
      ? { email: req.params.id }
      : { _id: new ObjectId(req.params.id) };
    let coach = await Coach.findOne(query).lean();

    if (!coach) {
      notifyError(new Error(`Coach ${req.params.id} not found`));

      const error = new Error(`Coach ${req.params.id} not found`);
      error.status = 404;
      throw error;
    }

    if (coach) {
      const coachServices = await Service.find({
        coachId: coach?._id,
      }).lean();

      coach = {
        ...coach,
        services: coachServices,
      };
    }

    if (req.query.isLogin) {
      Coach.updateOne(query, {
        $set: { lastLogin: new Date().toISOString() },
      });
    }

    const cookieName = !coach?.SSO ? "x_auth_token" : "x_auth_token_sso";
    const authorizationHeader = req.header(cookieName);
    let minute = 60 * 1000;
    res.setHeader(
      "Set-Cookie",
      cookie.serialize(cookieName, authorizationHeader, {
        httpOnly: true,
        maxAge: minute * 60,
        path: "/",
        sameSite: "none",
      })
    );

    res.status(200).json({ ...coach });
  } catch (error) {
    notifyError(new Error(error));

    res.status(error?.status || 500).json({ message: error.message });
  }
};

const userEmailExists = async (req, res) => {
  try {
    const email = req.params.email;
    console.log(email)
    const userExists = await Coach.findOne({ email }).lean();
    res.status(200).json({ exists: !!userExists, authMethod: userExists?.SSO });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const getCoachBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const coach = await Coach.findOne({ slug }).lean();
    res.status(200).json({ ...coach });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const deleteCoach = async (req, res) => {
  try {
    const isEmail = req.params.id.includes("@");
    const query = isEmail
      ? { email: req.params.id }
      : { _id: new ObjectId(req.params.id) };
    const coach = await Coach.findOne(query).lean();
    if (!coach) {
      res.status(400).json({ message: "not found" });
    }
    await Coach.deleteOne(query);
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

// una tabla de conversiones : guardar cada vez que un usuario crea un appointment
const getCoachStats = async (req, res) => {
  try {
    const coachId = new ObjectId(req.params.id);
    const coach = await Coach.findOne({ _id: coachId }).lean();

    const { weekStartDate, weekEndDate } = getCurrentWeek();
    const { endOfDay } = getCurrentDayBounds();
    const dateWeekFilters = {
      $gte: weekStartDate,
      $lte: weekEndDate,
    };
    const dayFilters = {
      $gte: new Date(),
      $lte: endOfDay,
    };
    const historicFiltes = {
      $gte: new Date("2021-01-01T00:00:00.000Z"),
      $lte: new Date(),
    };

    const clientsReq = Student.find({ coachId });
    const historicEventsReq = Event.find({
      coachId: coachId,
      startDate: historicFiltes,
    }).count();
    const eventsReq = Event.find({
      coachId: coachId,
      startDate: dateWeekFilters,
    });
    const eventsLeftTodayReq = Event.find({
      coachId: coachId,
      startDate: dayFilters,
    });

    const servicesReq = Service.find({
      _id: { $in: [...coach.services] },
    }).lean();

    const [clients, historicEvents, events, eventsLeftToday, services] =
      await Promise.all([
        clientsReq,
        historicEventsReq,
        eventsReq,
        eventsLeftTodayReq,
        servicesReq,
      ]);

    let servicesStats = {
      byServices: [],
      uniqueVisits: 0,
      totalVisits: 0,
    };

    services.forEach((service) => {
      const bookedSeats = service.totalSeats - service.seatsLeft;
      const completionPercentage = getPercentage(
        service.totalSeats,
        bookedSeats
      );
      servicesStats = {
        byServices: [
          ...servicesStats.byServices,
          {
            serviceId: service._id,
            title: service.title,
            bookedSeats,
            completionPercentage,
            totalSeats: service.totalSeats,
            seatsLeft: service.seatsLeft,
            uniqueVisits: service.views?.uniqueVisits || 0,
            totalVisits: service.views?.totalVisits || 0,
          },
        ],
        combinedUniqueVisits:
          servicesStats.uniqueVisits + service.views?.uniqueVisits ?? 0,
        combinedTotalVisits:
          servicesStats.totalVisits + service.views?.totalVisits ?? 0,
      };
    });

    const { startOfMonth, endOfMonth } = getStartAndEndOfCurrentMonth();

    const clientsCreatedThisMonth = await Student.find({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
      coachId,
    }).count();

    const stats = {
      uniqueVisits: coach.profileViews?.uniqueVisits ?? 0,
      totalVisits: coach.profileViews?.totalVisits ?? 0,
      totalServiceConversion: 0,
      appointmentsThisWeek: events,
      eventsLeftToday: eventsLeftToday.length,
      clients: clients.length,
      totalAmountOfAppointmentsToDate: historicEvents,
      servicesStats,
      clientsCreatedThisMonth,
      serviceVisitsThisMonth: 0,
      profileVisitsThisMonth: 0,
    };
    res.status(200).json({ ...stats });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const updateCoachViews = async (req, res) => {
  try {
    const { id } = req.params;

    await Coach.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          profileViews: req.body.profileViews,
        },
      }
    );

    res.status(200).json({ message: "OK" });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

const updateCoachReviews = async (req, res) => {
  try {
    const { id } = req.params;

    await Coach.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          reviews: req.body.newReview,
        },
      }
    );

    const updatedReviews = await Coach.findOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: "OK", reviews: updatedReviews.reviews });
  } catch (error) {
    notifyError(new Error(error));

    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateCoach,
  createCoach,
  getCoach,
  deleteCoach,
  getCoachBySlug,
  getCoachStats,
  checkSSOToken,
  updateCoachReviews,
  updateCoachViews,
  userEmailExists,
};
