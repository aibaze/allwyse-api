const { MailtrapClient } = require("mailtrap");

const { ObjectId } = require("mongodb");
const { Student } = require("../../../models/Student");
const Coach = require("../../../models/Coach");
const { Service } = require("../../../models/Service");

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
      text: `Welcome ${student.firstName}, ${coach.firstName} ${
        coach.lastName
      } has invited you to sign up in its platform to start you process  ${
        service?.title ? `into the ${service.title} service` : ""
      } !!, please click here to create your account www.allwyse.io/auth/register`,
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

    if (!coach) {
      throw new Error("Coach not found");
    }

    const students = await Student.find({ _id: { $in: coach.students } });

    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStudent,
  getStudentsByCoach
};
