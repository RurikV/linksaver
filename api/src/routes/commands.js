const express = require('express');
const CommandManager = require('../services/command-manager');

const router = express.Router();

// Initialize command manager (in production, this would be singleton)
const commandManager = new CommandManager();

// Create link using Command Pattern
router.post('/links/create', async (req, res) => {
  try {
    const { userId } = req;
    const linkData = req.body;

    const context = {
      userId,
      requestId: req.id,
      timestamp: Date.now()
    };

    const result = await commandManager.createLink(context, linkData);

    res.json({
      success: result.success,
      ...result,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error creating link with command:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update link using Command Pattern
router.put('/links/:linkId', async (req, res) => {
  try {
    const { userId } = req;
    const { linkId } = req.params;
    const updateData = req.body;

    const context = {
      userId,
      requestId: req.id,
      timestamp: Date.now()
    };

    const result = await commandManager.updateLink(context, linkId, updateData);

    res.json({
      success: result.success,
      ...result,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error updating link with command:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete link using Command Pattern
router.delete('/links/:linkId', async (req, res) => {
  try {
    const { userId } = req;
    const { linkId } = req.params;

    const context = {
      userId,
      requestId: req.id,
      timestamp: Date.now()
    };

    const result = await commandManager.deleteLink(context, linkId);

    res.json({
      success: result.success,
      ...result,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error deleting link with command:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Undo last command
router.post('/undo', async (req, res) => {
  try {
    const { userId } = req;

    const context = {
      userId,
      requestId: req.id,
      timestamp: Date.now()
    };

    const result = await commandManager.undo();

    res.json({
      success: true,
      ...result,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error undoing command:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Redo last undone command
router.post('/redo', async (req, res) => {
  try {
    const { userId } = req;

    const context = {
      userId,
      requestId: req.id,
      timestamp: Date.now()
    };

    const result = await commandManager.redo();

    res.json({
      success: true,
      ...result,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error redoing command:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get command history
router.get('/history', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const history = commandManager.getHistory({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      ...history
    });

  } catch (error) {
    console.error('Error getting command history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get command statistics
router.get('/statistics', async (req, res) => {
  try {
    const statistics = commandManager.getStatistics();

    res.json({
      success: true,
      ...statistics
    });

  } catch (error) {
    console.error('Error getting command statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get command manager status
router.get('/status', async (req, res) => {
  try {
    const status = {
      canUndo: commandManager.canUndo(),
      canRedo: commandManager.canRedo(),
      historySize: commandManager.commandHistory.length,
      undoStackSize: commandManager.undoStack.length,
      redoStackSize: commandManager.redoStack.length,
      lastCommand: commandManager.getLastCommand()
    };

    res.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Error getting command status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear command history
router.delete('/history', async (req, res) => {
  try {
    commandManager.clearHistory();

    res.json({
      success: true,
      message: 'Command history cleared successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error clearing command history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;