const mongoose = require("mongoose");

const Link = mongoose.model("Link");
const Tag = mongoose.model("Tag");

exports.updateLink = async (req, res) => {
  const { userId, params, body, query } = req;
  const { tags } = body;
  const { linkId } = params;
  const { returnAllTags } = query;

  const existingLink = await Link.findOne({ linkId, user: userId });

  // If the link doesn't exist, return an error
  if (!existingLink) {
    res.status(400).send({
      error: "Link does not exist or you do not have access to it",
    });
    return;
  }

  // If the user wants all tags, get them
  let allTags;
  if (returnAllTags) {
    allTags = await Tag.find({ user: userId });
  }

  let tagsToAdd = [];
  let newTags = []; // Stored outside so we can pass to UI
  if (tags.length) {
    const newTagTitles = [];
    const existingTagIds = [];

    // Figure out what's new and existing for tags
    tags.forEach((t) => {
      if (t.tagId) {
        existingTagIds.push(t.tagId);
      } else {
        newTagTitles.push(t.title);
      }
    });

    // Grab existing tag data
    const existingTags = await Tag.find({
      tagId: { $in: existingTagIds },
      user: userId,
    });

    // Create new tags
    newTags = await Tag.insertMany(
      newTagTitles.map((t) => ({ title: t, user: userId }))
    );

    // Combine existing and new tags
    tagsToAdd = [...existingTags, ...newTags];
  }

  const link = await Link.findOneAndUpdate(
    { linkId, user: userId },
    { tags: tagsToAdd.map((t) => t._id) },
    {
      new: true,
    }
  );

  const parsedLink = {
    linkId: link.linkId,
    title: link.title,
    url: link.url,
    date: link.createdAt,
    tags: tagsToAdd.map((t) => ({
      tagId: t.tagId,
      title: t.title,
    })),
  };

  res.status(200).send({
    link: parsedLink,
    tags: returnAllTags
      ? allTags.map((t) => ({ tagId: t.tagId, title: t.title }))
      : newTags.map((t) => ({ tagId: t.tagId, title: t.title })),
  });
};
