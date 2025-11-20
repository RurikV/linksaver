const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const router = express.Router();

// Collection Schema
const collectionSchema = new mongoose.Schema({
  collectionId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  links: [{ type: mongoose.Schema.ObjectId, ref: "Link" }],
  cmsPages: [{ type: String }], // CMS page slugs included in collection
  isPublic: { type: Boolean, default: false },
  tags: [{ type: mongoose.Schema.ObjectId, ref: "Tag" }],
  metadata: {
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Collection = mongoose.model("Collection", collectionSchema);

// Get user's collections
router.get("/", async (req, res) => {
  try {
    const { userId, query } = req;
    const { includePublic = false, limit = 20, page = 1 } = query;

    let filter = { user: userId };

    if (includePublic === 'true') {
      filter = {
        $or: [
          { user: userId },
          { isPublic: true }
        ]
      };
    }

    const collections = await Collection.find(filter)
      .populate("links", "title url createdAt")
      .populate("tags", "tagId title")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Collection.countDocuments(filter);

    res.json({
      collections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error getting collections:", error);
    res.status(500).json({ error: "Failed to get collections" });
  }
});

// Create new collection
router.post("/", async (req, res) => {
  try {
    const { userId, body } = req;
    const { title, description, linkIds, cmsPages, isPublic, tagIds } = body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const { v4: uuid } = require("uuid");

    const collection = new Collection({
      collectionId: uuid(),
      title,
      description,
      user: userId,
      links: linkIds || [],
      cmsPages: cmsPages || [],
      isPublic: isPublic || false,
      tags: tagIds || []
    });

    await collection.save();

    res.status(201).json({
      message: "Collection created successfully",
      collection: await Collection.findById(collection._id)
        .populate("links", "title url createdAt")
        .populate("tags", "tagId title")
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    res.status(500).json({ error: "Failed to create collection" });
  }
});

// Get collection by ID
router.get("/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await Collection.findOne({ collectionId })
      .populate("links", "title url createdAt tags")
      .populate("tags", "tagId title")
      .populate("user", "email");

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Increment views if it's a public collection
    if (collection.isPublic) {
      collection.metadata.views += 1;
      await collection.save();
    }

    // Get full link details with tags
    const Link = mongoose.model("Link");
    const linksWithDetails = await Link.find({
      _id: { $in: collection.links }
    }).populate("tags");

    // Get CMS page details if any
    const cmsPageDetails = [];
    if (collection.cmsPages && collection.cmsPages.length > 0) {
      for (const pageSlug of collection.cmsPages) {
        try {
          const response = await axios.get(`http://localhost:7781/v1/pages/${pageSlug}`, {
            headers: { "X-Link-Saver": "1" }
          });
          if (response.status === 200) {
            const pageData = response.data;
            cmsPageDetails.push({
              slug: pageSlug,
              title: pageData.meta?.title || pageSlug,
              description: pageData.meta?.description || '',
              content: pageData.root
            });
          }
        } catch (error) {
          console.error(`Failed to fetch CMS page ${pageSlug}:`, error);
        }
      }
    }

    res.json({
      collection: {
        ...collection.toObject(),
        links: linksWithDetails,
        cmsPages: cmsPageDetails
      }
    });
  } catch (error) {
    console.error("Error getting collection:", error);
    res.status(500).json({ error: "Failed to get collection" });
  }
});

// Update collection
router.put("/:collectionId", async (req, res) => {
  try {
    const { userId, body } = req;
    const { collectionId } = req.params;
    const { title, description, linkIds, cmsPages, isPublic, tagIds } = body;

    const collection = await Collection.findOne({ collectionId, user: userId });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Update fields
    if (title) collection.title = title;
    if (description !== undefined) collection.description = description;
    if (linkIds !== undefined) collection.links = linkIds;
    if (cmsPages !== undefined) collection.cmsPages = cmsPages;
    if (isPublic !== undefined) collection.isPublic = isPublic;
    if (tagIds !== undefined) collection.tags = tagIds;

    await collection.save();

    res.json({
      message: "Collection updated successfully",
      collection: await Collection.findById(collection._id)
        .populate("links", "title url createdAt")
        .populate("tags", "tagId title")
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    res.status(500).json({ error: "Failed to update collection" });
  }
});

// Delete collection
router.delete("/:collectionId", async (req, res) => {
  try {
    const { userId } = req;
    const { collectionId } = req.params;

    const collection = await Collection.findOneAndDelete({ collectionId, user: userId });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    res.status(500).json({ error: "Failed to delete collection" });
  }
});

// Like/Unlike collection
router.post("/:collectionId/like", async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await Collection.findOne({ collectionId, isPublic: true });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    collection.metadata.likes += 1;
    await collection.save();

    res.json({ likes: collection.metadata.likes });
  } catch (error) {
    console.error("Error liking collection:", error);
    res.status(500).json({ error: "Failed to like collection" });
  }
});

// Get public collections (discover)
router.get("/public/discover", async (req, res) => {
  try {
    const { limit = 20, page = 1, sortBy = 'likes' } = req.query;

    let sort = { createdAt: -1 };
    switch (sortBy) {
      case 'likes':
        sort = { 'metadata.likes': -1 };
        break;
      case 'views':
        sort = { 'metadata.views': -1 };
        break;
      case 'recent':
        sort = { createdAt: -1 };
        break;
    }

    const collections = await Collection.find({ isPublic: true })
      .populate("user", "email")
      .populate("tags", "tagId title")
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Collection.countDocuments({ isPublic: true });

    res.json({
      collections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error getting public collections:", error);
    res.status(500).json({ error: "Failed to get public collections" });
  }
});

// Generate smart collection suggestions
router.get("/suggestions/generate", async (req, res) => {
  try {
    const { userId, query } = req;
    const { basedOn = 'tags', limit = 5 } = query;

    const Link = mongoose.model("Link");
    const Tag = mongoose.model("Tag");

    let suggestions = [];

    if (basedOn === 'tags') {
      // Get user's most used tags
      const tagUsage = await Link.aggregate([
        { $match: { user: userId } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]);

      for (const tagUsageItem of tagUsage) {
        const tag = await Tag.findById(tagUsageItem._id);
        if (tag) {
          const links = await Link.find({
            user: userId,
            tags: tagUsageItem._id
          }).limit(5);

          if (links.length >= 3) {
            suggestions.push({
              type: 'tag-based',
              title: `${tag.title} Resources`,
              description: `Your ${links.length} saved links related to ${tag.title}`,
              linkIds: links.map(link => link._id),
              tagIds: [tagUsageItem._id]
            });
          }
        }
      }
    } else if (basedOn === 'recent') {
      // Get recent links that could be grouped
      const recentLinks = await Link.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(15);

      // Group by domain
      const domainGroups = {};
      recentLinks.forEach(link => {
        try {
          const domain = new URL(link.url).hostname;
          if (!domainGroups[domain]) domainGroups[domain] = [];
          domainGroups[domain].push(link);
        } catch (error) {
          // Invalid URL, skip
        }
      });

      Object.entries(domainGroups).forEach(([domain, links]) => {
        if (links.length >= 3) {
          suggestions.push({
            type: 'domain-based',
            title: `${domain} Collection`,
            description: `Your ${links.length} saved links from ${domain}`,
            linkIds: links.map(link => link._id)
          });
        }
      });
    }

    res.json({ suggestions: suggestions.slice(0, parseInt(limit)) });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
});

module.exports = router;