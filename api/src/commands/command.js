/**
 * Base Command Class - Implements the Command Pattern
 * Each user action is encapsulated as a command that can be executed and undone
 */
class Command {
  constructor(context, options = {}) {
    this.context = context;
    this.options = options;
    this.timestamp = Date.now();
    this.id = this.generateId();
    this.status = 'pending';
    this.result = null;
    this.undoData = null;
  }

  /**
   * Generate unique command ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Execute the command
   * @returns {Promise<Object>} Command result
   */
  async execute() {
    throw new Error('execute method must be implemented by concrete command');
  }

  /**
   * Undo the command
   * @returns {Promise<Object>} Undo result
   */
  async undo() {
    throw new Error('undo method must be implemented by concrete command');
  }

  /**
   * Validate command before execution
   * @returns {Promise<Object>} Validation result
   */
  async validate() {
    return { valid: true };
  }

  /**
   * Get command description for logging
   * @returns {string} Description
   */
  getDescription() {
    return `${this.constructor.name} command`;
  }

  /**
   * Get command metadata
   * @returns {Object} Metadata
   */
  getMetadata() {
    return {
      id: this.id,
      type: this.constructor.name,
      timestamp: this.timestamp,
      status: this.status,
      userId: this.context.userId
    };
  }
}

module.exports = Command;