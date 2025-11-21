const { CreateLinkCommand, UpdateLinkCommand, DeleteLinkCommand } = require('../commands/link-commands');

/**
 * Command Manager - Implements the Command Pattern with undo/redo functionality
 * Manages command execution and maintains history for undo/redo operations
 */
class CommandManager {
  constructor() {
    this.commandHistory = [];
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistorySize = 100;
  }

  /**
   * Execute a command and add to history
   * @param {Command} command - Command to execute
   * @returns {Promise<Object>} Command result
   */
  async executeCommand(command) {
    try {
      // Validate command before execution
      const validation = await command.validate();
      if (!validation.valid) {
        throw new Error(`Command validation failed: ${validation.errors.join(', ')}`);
      }

      // Execute the command
      const result = await command.execute();

      // Add to history if execution was successful
      if (result && result.success) {
        this.addToHistory(command);

        // Clear redo stack when new command is executed
        this.redoStack = [];
      }

      return {
        success: true,
        command: command.getMetadata(),
        result,
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        command: command.getMetadata()
      };
    }
  }

  /**
   * Undo the last command
   * @returns {Promise<Object>} Undo result
   */
  async undo() {
    if (!this.canUndo()) {
      throw new Error('No commands to undo');
    }

    const lastCommand = this.undoStack.pop();

    try {
      const undoResult = await lastCommand.undo();

      // Move command to redo stack
      this.redoStack.push(lastCommand);

      return {
        success: true,
        undone: true,
        command: lastCommand.getMetadata(),
        result: undoResult,
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      };

    } catch (error) {
      // Put command back on undo stack if undo fails
      this.undoStack.push(lastCommand);
      throw new Error(`Undo failed: ${error.message}`);
    }
  }

  /**
   * Redo the last undone command
   * @returns {Promise<Object>} Redo result
   */
  async redo() {
    if (!this.canRedo()) {
      throw new Error('No commands to redo');
    }

    const commandToRedo = this.redoStack.pop();

    try {
      const redoResult = await commandToRedo.execute();

      // Move command back to undo stack
      this.undoStack.push(commandToRedo);

      return {
        success: true,
        redone: true,
        command: commandToRedo.getMetadata(),
        result: redoResult,
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      };

    } catch (error) {
      // Put command back on redo stack if redo fails
      this.redoStack.push(commandToRedo);
      throw new Error(`Redo failed: ${error.message}`);
    }
  }

  /**
   * Create and execute a CreateLink command
   * @param {Object} context - Request context
   * @param {Object} linkData - Link data
   * @returns {Promise<Object>} Command result
   */
  async createLink(context, linkData) {
    const command = new CreateLinkCommand(context, linkData);
    return await this.executeCommand(command);
  }

  /**
   * Create and execute an UpdateLink command
   * @param {Object} context - Request context
   * @param {string} linkId - Link ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Command result
   */
  async updateLink(context, linkId, updateData) {
    const command = new UpdateLinkCommand(context, linkId, updateData);
    return await this.executeCommand(command);
  }

  /**
   * Create and execute a DeleteLink command
   * @param {Object} context - Request context
   * @param {string} linkId - Link ID
   * @returns {Promise<Object>} Command result
   */
  async deleteLink(context, linkId) {
    const command = new DeleteLinkCommand(context, linkId);
    return await this.executeCommand(command);
  }

  /**
   * Add command to history
   * @param {Command} command - Command to add
   */
  addToHistory(command) {
    this.commandHistory.push(command.getMetadata());

    // Add to undo stack
    this.undoStack.push(command);

    // Maintain history size limit
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }

    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
  }

  /**
   * Check if undo is possible
   * @returns {boolean} True if undo is possible
   */
  canUndo() {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is possible
   * @returns {boolean} True if redo is possible
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Get command history
   * @param {Object} options - Options for history retrieval
   * @returns {Object} Command history and status
   */
  getHistory(options = {}) {
    const { limit = 20, offset = 0 } = options;

    return {
      history: this.commandHistory.slice(-limit - offset).slice(0, limit),
      total: this.commandHistory.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoStackSize: this.undoStack.length,
      redoStackSize: this.redoStack.length
    };
  }

  /**
   * Get last executed command
   * @returns {Object|null} Last command metadata
   */
  getLastCommand() {
    return this.commandHistory.length > 0
      ? this.commandHistory[this.commandHistory.length - 1]
      : null;
  }

  /**
   * Clear all history and stacks
   */
  clearHistory() {
    this.commandHistory = [];
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Get statistics about command usage
   * @returns {Object} Command statistics
   */
  getStatistics() {
    const commandCounts = {};

    for (const command of this.commandHistory) {
      commandCounts[command.type] = (commandCounts[command.type] || 0) + 1;
    }

    return {
      totalCommands: this.commandHistory.length,
      commandCounts,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      historySize: this.commandHistory.length,
      undoStackSize: this.undoStack.length,
      redoStackSize: this.redoStack.length
    };
  }
}

module.exports = CommandManager;