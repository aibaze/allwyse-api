const { ObjectId } = require("mongodb");
const { Post } = require("../../../models/Post");
const Coach = require("../../../models/Coach");

const createPost = async (req, res) => {
  try {
    const coachId = new ObjectId(req.body.coachId);
    const coach = await Coach.findOne({ _id: coachId });
    if (coach) {
      throw new Error("Coach not found");
    }

    const body = {
      ...req.body,
      author: {
        name: coach.profileInfo.name,
        avatarUrl: coach.profileInfo.profileImg,
        profileUrl: `www.allwyse/io/info/${coach.slug}`,
      },
      comments: [],
      createdAt: new Date().toISOString(),
    };
    const newPost = await Post.create(body);
    res.status(201).json({ post: newPost });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
};
