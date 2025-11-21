const Command = require('./command');
const Link = require('../models/link');
const Tag = require('../models/tag');

/**
 * Create Link Command - Encapsulates link creation logic
 * Can be undone by deleting the created link
 */
class CreateLinkCommand extends Command {
  constructor(context, linkData) {
    super(context);
    this.linkData = linkData;
    this.createdLink = null;
  }

  async validate() {
    const errors = [];

    // Required fields
    if (!this.linkData.url) {
      errors.push('URL is required');
    } else {
      try {
        new URL(this.linkData.url);
      } catch (error) {
        errors.push('Invalid URL format');
      }
    }

    if (!this.linkData.title || this.linkData.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!this.context.userId) {
      errors.push('User ID is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async execute() {
    try {
      this.status = 'executing';

      // Auto-generate title if missing
      if (!this.linkData.title && this.linkData.url) {
        this.linkData.title = await this.extractTitleFromUrl(this.linkData.url);
      }

      // Process tags
      const tagIds = await this.processTags(this.linkData.tags);

      // Create link
      const link = new Link({
        linkId: this.linkData.linkId || this.generateId(),
        title: this.linkData.title,
        url: this.linkData.url,
        description: this.linkData.description || '',
        user: this.context.userId,
        tags: tagIds,
        favicon: this.linkData.favicon || '',
        source: this.linkData.source || 'manual',
        metadata: this.linkData.metadata || {}
      });

      await link.save();
      await link.populate('tags');

      // Store undo data
      this.createdLink = link.toObject();
      this.undoData = { linkId: link.linkId };

      this.status = 'completed';
      this.result = {
        success: true,
        link: this.transformLink(link.toObject())
      };

      return this.result;

    } catch (error) {
      this.status = 'failed';
      throw error;
    }
  }

  async undo() {
    if (!this.createdLink) {
      throw new Error('Cannot undo: command was not successfully executed');
    }

    try {
      // Delete the created link
      await Link.findOneAndDelete({
        linkId: this.createdLink.linkId,
        user: this.context.userId
      });

      this.status = 'undone';
      this.result = {
        success: true,
        undone: true,
        linkId: this.createdLink.linkId
      };

      return this.result;

    } catch (error) {
      this.status = 'undo-failed';
      throw error;
    }
  }

  async extractTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return 'Untitled';
    }
  }

  async processTags(tagStrings = []) {
    const tagIds = [];

    if (tagStrings && Array.isArray(tagStrings)) {
      for (const tagString of tagStrings) {
        const tag = await Tag.findOne({
          tagId: tagString.toLowerCase(),
          user: this.context.userId
        });

        if (!tag) {
          const newTag = new Tag({
            tagId: tagString.toLowerCase(),
            title: tagString,
            user: this.context.userId
          });
          await newTag.save();
          tagIds.push(newTag._id);
        } else {
          tagIds.push(tag._id);
        }
      }
    }

    return tagIds;
  }

  transformLink(link) {
    return {
      linkId: link.linkId,
      title: link.title,
      url: link.url,
      description: link.description,
      tags: link.tags ? link.tags.map(tag => ({
        tagId: tag.tagId,
        title: tag.title,
        id: tag._id
      })) : [],
      createdAt: link.createdAt,
      source: link.source
    };
  }

  getDescription() {
    return `Create link: ${this.linkData.title}`;
  }
}

/**
 * Update Link Command - Encapsulates link update logic
 * Can be undone by restoring original link data
 */
class UpdateLinkCommand extends Command {
  constructor(context, linkId, updateData) {
    super(context);
    this.linkId = linkId;
    this.updateData = updateData;
    this.originalLink = null;
    this.updatedLink = null;
  }

  async validate() {
    const errors = [];

    if (!this.linkId) {
      errors.push('Link ID is required');
    }

    if (!this.context.userId) {
      errors.push('User ID is required');
    }

    if (this.updateData.url) {
      try {
        new URL(this.updateData.url);
      } catch (error) {
        errors.push('Invalid URL format');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async execute() {
    try {
      this.status = 'executing';

      // Find existing link
      const link = await Link.findOne({ linkId: this.linkId, user: this.context.userId });
      if (!link) {
        throw new Error('Link not found');
      }

      // Store original data for undo
      this.originalLink = link.toObject();

      // Process tags if provided
      let tagIds = link.tags;
      if (this.updateData.tags) {
        tagIds = await this.processTags(this.updateData.tags);
      }

      // Update link fields
      if (this.updateData.title) link.title = this.updateData.title;
      if (this.updateData.url) link.url = this.updateData.url;
      if (this.updateData.description !== undefined) link.description = this.updateData.description;
      if (tagIds.length > 0) link.tags = tagIds;

      link.metadata = {
        ...link.metadata,
        ...this.updateData.metadata,
        updatedAt: new Date()
      };

      await link.save();
      await link.populate('tags');

      // Store updated data for undo
      this.updatedLink = link.toObject();

      this.status = 'completed';
      this.result = {
        success: true,
        updated: true,
        link: this.transformLink(link.toObject())
      };

      return this.result;

    } catch (error) {
      this.status = 'failed';
      throw error;
    }
  }

  async undo() {
    if (!this.originalLink) {
      throw new Error('Cannot undo: command was not successfully executed');
    }

    try {
      // Restore original link
      const link = await Link.findOne({ linkId: this.linkId, user: this.context.userId });
      if (!link) {
        throw new Error('Link not found for undo operation');
      }

      // Restore original fields
      Object.assign(link, this.originalLink);
      delete link._id; // Don't restore _id
      await link.save();
      await link.populate('tags');

      this.status = 'undone';
      this.result = {
        success: true,
        undone: true,
        link: this.transformLink(link.toObject())
      };

      return this.result;

    } catch (error) {
      this.status = 'undo-failed';
      throw error;
    }
  }

  async processTags(tagStrings = []) {
    const tagIds = [];

    if (tagStrings && Array.isArray(tagStrings)) {
      for (const tagString of tagStrings) {
        const tag = await Tag.findOne({
          tagId: tagString.toLowerCase(),
          user: this.context.userId
        });

        if (!tag) {
          const newTag = new Tag({
            tagId: tagString.toLowerCase(),
            title: tagString,
            user: this.context.userId
          });
          await newTag.save();
          tagIds.push(newTag._id);
        } else {
          tagIds.push(tag._id);
        }
      }
    }

    return tagIds;
  }

  transformLink(link) {
    return {
      linkId: link.linkId,
      title: link.title,
      url: link.url,
      description: link.description,
      tags: link.tags ? link.tags.map(tag => ({
        tagId: tag.tagId,
        title: tag.title,
        id: tag._id
      })) : [],
      createdAt: link.createdAt,
      source: link.source
    };
  }

  getDescription() {
    return `Update link: ${this.linkId}`;
  }
}

/**
 * Delete Link Command - Encapsulates link deletion logic
 * Can be undone by restoring the link with its data
 */
class DeleteLinkCommand extends Command {
  constructor(context, linkId) {
    super(context);
    this.linkId = linkId;
    this.deletedLink = null;
  }

  async validate() {
    const errors = [];

    if (!this.linkId) {
      errors.push('Link ID is required');
    }

    if (!this.context.userId) {
      errors.push('User ID is required');
    }

    // Check if link exists
    const link = await Link.findOne({ linkId: this.linkId, user: this.context.userId });
    if (!link) {
      errors.push('Link not found');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async execute() {
    try {
      this.status = 'executing';

      // Get link before deletion
      const link = await Link.findOne({ linkId: this.linkId, user: this.context.userId });
      if (!link) {
        throw new Error('Link not found');
      }

      // Store link data for undo
      this.deletedLink = link.toObject();

      // Delete the link
      await Link.findOneAndDelete({ linkId: this.linkId, user: this.context.userId });

      this.status = 'completed';
      this.result = {
        success: true,
        deleted: true,
        linkId: this.linkId,
        link: this.transformLink(this.deletedLink)
      };

      return this.result;

    } catch (error) {
      this.status = 'failed';
      throw error;
    }
  }

  async undo() {
    if (!this.deletedLink) {
      throw new Error('Cannot undo: command was not successfully executed');
    }

    try {
      // Restore deleted link
      const link = new Link(this.deletedLink);
      await link.save();
      await link.populate('tags');

      this.status = 'undone';
      this.result = {
        success: true,
        restored: true,
        link: this.transformLink(link.toObject())
      };

      return this.result;

    } catch (error) {
      this.status = 'undo-failed';
      throw error;
    }
  }

  transformLink(link) {
    return {
      linkId: link.linkId,
      title: link.title,
      url: link.url,
      description: link.description,
      tags: link.tags ? link.tags.map(tag => ({
        tagId: tag.tagId,
        title: tag.title,
        id: tag._id
      })) : [],
      createdAt: link.createdAt,
      source: link.source
    };
  }

  getDescription() {
    return `Delete link: ${this.linkId}`;
  }
}

module.exports = {
  CreateLinkCommand,
  UpdateLinkCommand,
  DeleteLinkCommand
};