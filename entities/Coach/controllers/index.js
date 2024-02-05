const { ObjectId } = require("mongodb");
const Coach = require("../../../models/Coach");
const { MailtrapClient } = require("mailtrap");
const cookie = require('cookie');
const createSlug = (firstName, lastName) => {
  const rawSlug = `${firstName?.toLowerCase()}-${lastName?.toLowerCase()}`;
  return rawSlug.replace(/ /g, "-");
};

const createCoach = async (req, res) => {
  try {
    const body = {
      ...req.body,
      slug: createSlug(req.body.firstName, req.body.lastName),
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
    const isEmail = req.params.id.includes("@");
    const query = isEmail
      ? { email: req.params.id }
      : { _id: new ObjectId(req.params.id) };
    const coach = await Coach.findOne(query).lean();
    const authorizationHeader = req.header("Authorization");

    let minute = 60 * 1000;
    res.setHeader('Set-Cookie', cookie.serialize('Authorization', authorizationHeader, {
      httpOnly: true,
      maxAge: minute * 60 ,
      path:"/"
    })); 
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

module.exports = {
  updateCoach,
  createCoach,
  getCoach,
  deleteCoach,
  getCoachBySlug,
};
