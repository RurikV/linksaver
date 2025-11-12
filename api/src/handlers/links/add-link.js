const mongoose = require("mongoose");
const axios = require("axios");

const Link = mongoose.model("Link");
const Tag = mongoose.model("Tag");

exports.addLink = async (req, res) => {
  const { userId, body, query } = req;
  const { url, title, tags } = body;
  const { returnAllTags } = query;

  const existingLink = await Link.findOne({ url, user: userId }).populate(
    "tags"
  );

  // We need to get all tags if the user wants them returned in the response
  let allTags;
  if (returnAllTags) {
    allTags = await Tag.find({ user: userId });
  }

  // If the link already exists, return it
  if (existingLink) {
    res.status(200).send({
      link: {
        linkId: existingLink.linkId,
        title: existingLink.title,
        url: existingLink.url,
        date: existingLink.createdAt,
        tags: existingLink.tags.map((t) => ({
          tagId: t.tagId,
          title: t.title,
        })),
      },
      tags: returnAllTags
        ? allTags.map((t) => ({ tagId: t.tagId, title: t.title }))
        : [],
      isNew: false,
    });
    return;
  }

  let linkTitle;
  // If we have the title, use it, otherwise we need to find it
  if (title) {
    linkTitle = title;
  } else {
    try {
      const response = await axios.get(url);

      // If we can't get the URL, its untitled
      if (!response || !response.data) {
        linkTitle = "Untitled";
      } else {
        // Use regex to find the title in the <title> tag or fall back to "Untitled"
        const foundTitle = response.data.match(/<title[^>]*>([^<]*)<\/title>/);
        linkTitle = foundTitle ? foundTitle[1] : "Untitled";
      }
    } catch (err) {
      // If we can't get the URL, its untitled, unless its not found
      if (err.code !== "ENOTFOUND") {
        linkTitle = "Untitled";
      } else {
        res.status(500).send({
          error: "Failed to find URL information",
        });
        return;
      }
    }
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

  const link = await Link.create({
    url,
    title: linkTitle,
    user: userId,
    tags: tagsToAdd.map((t) => t._id),
  });

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

  res.status(201).send({
    link: parsedLink,
    // Either return all tags or just the new ones
    tags: returnAllTags
      ? allTags.map((t) => ({ tagId: t.tagId, title: t.title }))
      : newTags.map((t) => ({ tagId: t.tagId, title: t.title })),
    isNew: true,
  });
};
