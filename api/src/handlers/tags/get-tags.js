const mongoose = require("mongoose");

const Tag = mongoose.model("Tag");

exports.getTags = async (req, res) => {
  const { userId } = req;

  const tags = await Tag.find({ user: userId });
  const parsedTags = tags.map((tag) => ({
    tagId: tag.tagId,
    title: tag.title,
  }));

  res.status(200).send({
    tags: parsedTags,
  });
};
