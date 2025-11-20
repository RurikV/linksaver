const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Link = mongoose.model("Link");
const Tag = mongoose.model("Tag");
const User = mongoose.model("User");

// Get popular links across all users
router.get("/popular-links", async (req, res) => {
  try {
    const { limit = 10, timeRange = "7d" } = req.query;

    // Calculate date filter based on timeRange
    const now = new Date();
    let dateFilter = new Date();

    switch (timeRange) {
      case "1d":
        dateFilter.setDate(now.getDate() - 1);
        break;
      case "7d":
        dateFilter.setDate(now.getDate() - 7);
        break;
      case "30d":
        dateFilter.setDate(now.getDate() - 30);
        break;
      default:
        dateFilter.setDate(now.getDate() - 7);
    }

    // Group links by URL and count saves
    const popularLinks = await Link.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: "$url",
          count: { $sum: 1 },
          titles: { $addToSet: "$title" },
          uniqueUsers: { $addToSet: "$user" }
        }
      },
      {
        $lookup: {
          from: "tags",
          localField: "_id", // This won't work directly, need to join through links
          foreignField: "_id",
          as: "tags"
        }
      },
      {
        $project: {
          url: "$_id",
          saveCount: "$count",
          uniqueUserCount: { $size: "$uniqueUsers" },
          title: { $arrayElemAt: ["$titles", 0] },
          titles: "$titles",
          _id: 0
        }
      },
      {
        $sort: { saveCount: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      timeRange,
      links: popularLinks
    });
  } catch (error) {
    console.error("Error getting popular links:", error);
    res.status(500).json({ error: "Failed to get popular links" });
  }
});

// Get trending tags
router.get("/trending-tags", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingTags = await Link.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "tags",
          localField: "_id",
          foreignField: "_id",
          as: "tagInfo"
        }
      },
      {
        $unwind: "$tagInfo"
      },
      {
        $project: {
          tagId: "$tagInfo.tagId",
          title: "$tagInfo.title",
          linkCount: "$count",
          _id: 0
        }
      },
      {
        $sort: { linkCount: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      tags: trendingTags
    });
  } catch (error) {
    console.error("Error getting trending tags:", error);
    res.status(500).json({ error: "Failed to get trending tags" });
  }
});

// Get user statistics
router.get("/user-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await Link.distinct("user").then(users => users.length);
    const totalLinks = await Link.countDocuments();
    const totalTags = await Tag.countDocuments();

    // Links per user stats
    const linksPerUser = await Link.aggregate([
      {
        $group: {
          _id: "$user",
          linkCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgLinksPerUser: { $avg: "$linkCount" },
          maxLinksPerUser: { $max: "$linkCount" },
          minLinksPerUser: { $min: "$linkCount" }
        }
      }
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      totalLinks,
      totalTags,
      avgLinksPerUser: linksPerUser[0]?.avgLinksPerUser || 0,
      maxLinksPerUser: linksPerUser[0]?.maxLinksPerUser || 0,
      minLinksPerUser: linksPerUser[0]?.minLinksPerUser || 0
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ error: "Failed to get user statistics" });
  }
});

// Get recent activity (for feed)
router.get("/recent-activity", async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recentLinks = await Link.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("tags")
      .populate("user", "email")
      .lean();

    res.json({
      activity: recentLinks.map(link => ({
        linkId: link.linkId,
        title: link.title,
        url: link.url,
        createdAt: link.createdAt,
        tags: link.tags.map(tag => ({
          tagId: tag.tagId,
          title: tag.title
        })),
        user: link.user?.email || "Anonymous"
      }))
    });
  } catch (error) {
    console.error("Error getting recent activity:", error);
    res.status(500).json({ error: "Failed to get recent activity" });
  }
});

module.exports = router;