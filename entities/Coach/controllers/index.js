const { ObjectId } = require("mongodb");
const Coach = require("../../../models/Coach");
const { Service } = require("../../../models/Service");
const { Event } = require("../../../models/Event");
const { Student } = require("../../../models/Student");
const { MailtrapClient } = require("mailtrap");
const cookie = require("cookie");
const { getCurrentWeek, getCurrentDayBounds } = require("../../../utils/date");

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

const createCoach = async (req, res) => {
  try {
    const existingCoach = await Coach.findOne({ email: req.body.email });
    if (existingCoach) {
      throw new Error(
        `Another account with ${req.body.email} email has already been taken`
      );
    }

    let slug = createSlug(req.body.firstName, req.body.lastName);
    const existingSlug = await Coach.findOne({ slug });
    if (existingSlug) {
      slug = handleUniqueSlug(slug);
    }
    const body = {
      ...req.body,
      slug,
    };
    const coach = await Coach.create(body);
    const TOKEN = process.env.EMAIL_API_KEY;
    const client = new MailtrapClient({ token: TOKEN });
    await client.send({
      from: { email: "info@allwyse.io" },
      to: [{ email: coach.email }],
      subject: `Welcome to Allwyse ${coach.firstName} ${coach.lastName}  !`,
      text: `Welcome to your own professional platform`,
    });
    res.status(201).json({ coach });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateCoach = async (req, res) => {
  try {
    const coachId = new ObjectId(req.params.id);
    const payload = req.body;
    let updatedBody = {};

    if (payload.categories) {
      updatedBody["profileInfo.categories"] = payload.categories;
    }

    if (payload.languages) {
      updatedBody["profileInfo.languages"] = payload.languages;
    }

    if (payload.location) {
      updatedBody["profileInfo.location"] = payload.location;
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

    await Coach.updateOne({ _id: coachId }, { $set: updatedBody });
    const coach = await Coach.findOne({ _id: coachId }).lean();
    res.status(201).json({ ...coach });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getCoach = async (req, res) => {
  try {
    const isEmail =
      req.params.id.includes("@") || req.params.id.includes(".com");
    console.log(isEmail, "isEmail", req.params.id);
    const query = isEmail
      ? { email: req.params.id }
      : { _id: new ObjectId(req.params.id) };
    const coach = await Coach.findOne(query).lean();
    const authorizationHeader = req.header("x_auth_token");

    if (req.query.isLogin) {
      Coach.updateOne(query, {
        $set: { lastLogin: new Date().toISOString() },
      });
    }

    let minute = 60 * 1000;
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("x_auth_token", authorizationHeader, {
        httpOnly: true,
        maxAge: minute * 60,
        path: "/",
        sameSite: "none",
      })
    );
    res.status(200).json({ ...coach });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getCoachBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const coach = await Coach.findOne({ slug }).lean();
    res.status(200).json({ ...coach });
  } catch (error) {
    console.log(error.message);
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
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const logNewView = async (req, res) => {
  try {
    const isFirstVisit = req.body.firstVisit;
    const coachId = new ObjectId(req.body.coachId);
    const currentCoach = await Coach.findOne({ _id: coachId });

    const body = {
      uniqueVisits: isFirstVisit
        ? currentCoach.profileViews.uniqueVisits + 1
        : currentCoach.profileViews.uniqueVisits,
      totalVisits: currentCoach.profileViews.totalVisits + 1,
    };

    await Coach.updateOne(
      { _id: coachId },
      {
        profileViews: body,
      }
    );

    res.status(201).json({ message: "OK" });
  } catch (error) {
    console.log(error.message);
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
      coachId: req.params.coachId,
      startDate: historicFiltes,
    }).count();
    const eventsReq = Event.find({
      coachId: req.params.coachId,
      startDate: dateWeekFilters,
    });
    const eventsLeftTodayReq = Event.find({
      coachId: req.params.coachId,
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
      services: [],
      uniqueVisits: 0,
      totalVisits: 0,
    };

    services.forEach((service) => {
      servicesStats = {
        byServices: [
          ...servicesStats.services,
          {
            serviceId: service._id,
            title: service.title,
            uniqueVisits: service.profileViews?.uniqueVisits,
            totalVisits: service.profileViews?.totalVisits,
          },
        ],
        combinedUniqueVisits:
          servicesStats.uniqueVisits + service.profileViews?.uniqueVisits ?? 0,
        combinedTotalVisits:
          servicesStats.totalVisits + service.profileViews?.totalVisits ?? 0,
      };
    });

    const stats = {
      uniqueVisits: coach.profileViews?.uniqueVisits ?? 0,
      totalVisits: coach.profileViews?.totalVisits ?? 0,
      appointmentsThisWeek: events,
      eventsLeftToday: eventsLeftToday.length,
      clients: clients.length,
      totalAmountOfAppointmentsToDate: historicEvents,
      servicesStats,
    };
    res.status(200).json({ ...stats });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateCoach,
  createCoach,
  getCoach,
  deleteCoach,
  getCoachBySlug,
  logNewView,
  getCoachStats,
};
