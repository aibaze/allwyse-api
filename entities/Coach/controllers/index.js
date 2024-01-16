const { ObjectId } = require("mongodb");
const Coach = require("../../../models/Coach");
/* const jsonwebtoken = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const jsonWebKeys = {
  keys: [
    {
      alg: "RS256",
      e: "AQAB",
      kid: "QIb3NkaNlydPkO8iRyybwL24bH95dKFXXA2Bx4fe9Ak=",
      kty: "RSA",
      n: "_a3AiL47VIgVgx6z3cfQHKanjqForDfH6d5UIQjNPwpCe7Zm-DGWchjKE8m73NcbOxIgUTfuMFPphRqTVT8HNOrzl5CEKDx6RHJDLBQRLJyKvLoXaXdY5u1oDZGU6RA0njhEGHhUVn4MJXiN-cP4MDOZguIf17YghuWO6DwuXbdwDPNJQr0ia8Vj3nIOKlhjTP5-bSxHMBkZZeWIV8zBGWdZQPNt-JOwhct81W5eYRAaXfVSZj4yguIBz4cCfASdRfSB7A3mZY9CM0O4SEIFk1Mt6o1XEHxrmK-bGAPNAgiJjzLx0U3pU1liha1EHq0EUmSeRk1PzYXCqT0najvAZw",
      use: "sig",
    },
    {
      alg: "RS256",
      e: "AQAB",
      kid: "d66WtUXZudiUYOfakjgYZP3W44iiVGJZBqQGhilBWpE=",
      kty: "RSA",
      n: "q8uBORp-x2khYaAbPsFIjw577c2K3gMECao8sZUmvB_3S8CyR7MJBLPgUoogrcibcs_3wXIhNF67Q2byKtBTn8qhAEetq-cDvEpHbPsDsvLQwzYK4sTAERKpoo1FdHr0cav-lk2nl8RIHx2o9Mp1fp02IFhMylOuSL-wTjMKtVwx9c6Ij5EKoUkVxLh2Oz_kXi4BSoeUOEpcRMUmF7IvfervkJHHcpIOhYwYQ22y6P1Ii_E2xHdGcQMhSX2RnXMLzlKzsqRXfKSg8udMRpKl9zyHAroHEfQkUoFWsPdszCYUQRQ-7F5xG1woJVlNsbx_xK6KZJ3xr-z0wu-eOs1yEw",
      use: "sig",
    },
  ],
}; */

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
