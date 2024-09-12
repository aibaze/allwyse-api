const { MailtrapClient } = require("mailtrap");

const { ObjectId } = require("mongodb");
const { Student } = require("../../../models/Student");
const { Event } = require("../../../models/Event");
const Coach = require("../../../models/Coach");
const { Service } = require("../../../models/Service");

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: new ObjectId(req.params.studentId),
    });
    if (!student) {
      throw new Error("Student not found");
    }

    await Student.deleteOne({ _id: new ObjectId(req.params.studentId) });
    res.status(201).json({ message: "Client deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
const createStudent = async (req, res) => {
  let body = req.body;

  try {
    const existingStudent = await Student.findOne({
      email: body.email,
      coachId: new ObjectId(body.coachId),
    }).lean();
    if (existingStudent) {
      throw new Error("This client is already in your portfolio");
    }

    const coachReq = Coach.findOne({ _id: new ObjectId(body.coachId) });
    let serviceReq = null;
    if (body.serviceId) {
      serviceReq = Service.findOne({ _id: new ObjectId(body.serviceId) });
    }
    const reqs = [coachReq];

    if (serviceReq) {
      reqs.push(serviceReq);
    }
    const [coach, service] = await Promise.all(reqs);

    let email = `Welcome ${body.firstName}, ${coach.firstName} ${coach.lastName} has invited you to sign up in its platform to start working your path to success!!, please click here to create your account www.allwyse.io/auth/register`;
    if (serviceReq && service) {
      email = `Welcome ${body.firstName}, ${coach.firstName} ${coach.lastName} has invited you to sign up in its platform to start you process within ${service.title} service !!, please click here to create your account www.allwyse.io/auth/register`;
      body = {
        ...body,
        services: [service._id],
      };
    }

    const student = await Student.create(body);
    await Coach.updateOne(
      { _id: new ObjectId(coach._id) },
      { $push: { students: student._id } }
    );

    const TOKEN = process.env.EMAIL_API_KEY;
    const client = new MailtrapClient({ token: TOKEN });

    await client.send({
      from: { email: "info@allwyse.io" },
      to: [{ email: student.email }],
      subject: `Hello from ${coach.firstName} ${coach.lastName} coaching platform !`,
      text: email,
    });
    res.status(201).json({ student });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getStudentsByCoach = async (req, res) => {
  try {
    const coach = await Coach.findOne({
      _id: new ObjectId(req.params.coachId),
    });
    if (!req.query.detailed) {
    }

    if (!coach) {
      throw new Error("Coach not found");
    }
    let matchObj = { _id: { $in: coach.students } };

    if (req.query.search) {
      matchObj = {
        ...matchObj,
        $or: [
          { email: { $regex: req.query.search, $options: "i" } },
          { firstName: { $regex: req.query.search, $options: "i" } },
          { lastName: { $regex: req.query.search, $options: "i" } },
        ],
      };
    }
    let students = [];

    if (!req.query.detailed) {
      students = await Student.find(matchObj);
    } else {
      students = await Student.aggregate([
        { $match: matchObj },
        {
          $lookup: {
            from: "events",
            localField: "_id",
            foreignField: "studentId",
            as: "events",
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "services",
            foreignField: "_id",
            as: "servicesDetails",
          },
        },
      ]);
    }

    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStudent,
  getStudentsByCoach,
  deleteStudent,
};
