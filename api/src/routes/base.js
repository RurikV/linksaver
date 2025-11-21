const express = require("express");
const Link = require("../models/link");
const Tag = require("../models/tag");

const router = express.Router();

router.get("/", (req, res) => {
  // Used for health check
  res.status(200).send();
});

// Public links endpoint for Content Hub demonstration
router.get("/public/links", async (req, res) => {
  try {
    const { limit = 20, offset = 0, search, tag } = req.query;

    let query = {};

    // Apply search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply tag filter
    if (tag) {
      const tagDoc = await Tag.findOne({ name: tag });
      if (tagDoc) {
        query.tags = tagDoc._id;
      }
    }

    const links = await Link.find(query)
      .populate('tags')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const total = await Link.countDocuments(query);

    res.json({
      success: true,
      data: links,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching public links:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Public tags endpoint for Content Hub demonstration
router.get("/public/tags", async (req, res) => {
  try {
    const tags = await Tag.find({})
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      data: tags
    });

  } catch (error) {
    console.error('Error fetching public tags:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Public statistics endpoint for Content Hub demonstration
router.get("/public/stats", async (req, res) => {
  try {
    const totalLinks = await Link.countDocuments();
    const totalTags = await Tag.countDocuments();

    // Get tag distribution
    const tagStats = await Link.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'tags', localField: '_id', foreignField: '_id', as: 'tag' } },
      { $unwind: '$tag' },
      { $project: { name: '$tag.name', count: 1 } }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Link.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalLinks,
        totalTags,
        recentActivity,
        topTags: tagStats
      }
    });

  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
