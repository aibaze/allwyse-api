const { Event } = require("../../../models/Event");

const createEvent = async (req, res) => {
  try {
    const event = await Event.create({...req.body,title:`${req.body.studentName} (${req.body.description})` });
    res.status(201).json({ event });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};


module.exports = { createEvent };
