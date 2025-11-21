const DataAdapter = require('./data-adapter');
const mongoose = require('mongoose');
const Link = require('../../models/link');
const Tag = require('../../models/tag');

/**
 * MongoDB Adapter - Default data source for LinkSaver
 * Provides access to the MongoDB LinkSaver database
 */
class MongoAdapter extends DataAdapter {
  constructor(options = {}) {
    super('mongodb', options);
    this.dbUrl = options.dbUrl || process.env.MONGODB_URI;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    if (!this.dbUrl) {
      throw new Error('MongoDB URL is required');
    }

    try {
      await mongoose.connect(this.dbUrl);
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
  }

  async getLinks(filters = {}) {
    await this.initialize();

    const query = { user: filters.userId };

    if (filters.tags && filters.tags.length > 0) {
      const tagObjects = await Tag.find({
        tagId: { $in: filters.tags },
        user: filters.userId
      });
      const tagIds = tagObjects.map(tag => tag._id);
      query.tags = { $in: tagIds };
    }

    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }

    if (filters.domain) {
      query.url = { $regex: `https?://([\\w.-]+\\.)?${filters.domain}`, $options: 'i' };
    }

    const links = await Link.find(query)
      .populate('tags')
      .sort({ createdAt: filters.sortBy === 'oldest' ? 1 : -1 })
      .limit(parseInt(filters.limit) || 100)
      .skip(parseInt(filters.offset) || 0);

    return links.map(link => this.transformToLink({
      ...link.toObject(),
      id: link.linkId
    }));
  }

  async saveLinks(links) {
    await this.initialize();

    const results = {
      success: [],
      errors: [],
      total: links.length
    };

    for (const linkData of links) {
      try {
        const validation = this.validateLink(linkData);
        if (!validation.valid) {
          results.errors.push({
            link: linkData,
            errors: validation.errors
          });
          continue;
        }

        // Handle tags
        const tagIds = [];
        if (linkData.tags && linkData.tags.length > 0) {
          for (const tagName of linkData.tags) {
            let tag = await Tag.findOne({
              tagId: tagName.toLowerCase(),
              user: linkData.user
            });

            if (!tag) {
              tag = new Tag({
                tagId: tagName.toLowerCase(),
                title: tagName,
                user: linkData.user
              });
              await tag.save();
            }
            tagIds.push(tag._id);
          }
        }

        const link = new Link({
          linkId: linkData.linkId || this.generateId(),
          title: linkData.title,
          url: linkData.url,
          description: linkData.description || '',
          user: linkData.user,
          tags: tagIds,
          favicon: linkData.favicon || '',
          source: linkData.source || 'manual',
          metadata: linkData.metadata || {}
        });

        await link.save();
        await link.populate('tags');

        results.success.push(this.transformToLink({
          ...link.toObject(),
          id: link.linkId
        }));

      } catch (error) {
        results.errors.push({
          link: linkData,
          error: error.message
        });
      }
    }

    return results;
  }

  async testConnection() {
    try {
      await this.initialize();
      const count = await Link.countDocuments();
      return {
        status: 'success',
        message: 'MongoDB connection successful',
        details: {
          database: mongoose.connection.name,
          collections: await mongoose.connection.db.listCollections().toArray(),
          linkCount: count
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'MongoDB connection failed',
        error: error.message
      };
    }
  }

  getCapabilities() {
    return {
      source: this.source,
      supportedFormats: ['json'],
      features: ['crd', 'tagging', 'search', 'pagination'],
      options: this.options
    };
  }
}

module.exports = MongoAdapter;