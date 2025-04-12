const express = require('express');
const AppwriteService = require('../services/appwrite-service');

const router = express.Router();

// Get active sessions
router.get('/active', async (req, res) => {
  try {
    const sessions = await AppwriteService.getActiveSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error in /sessions/active:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

// Get sessions by device
router.get('/by-device', async (req, res) => {
  try {
    const data = await AppwriteService.getSessionsByDevice();
    res.json({ data });
  } catch (error) {
    console.error('Error in /sessions/by-device:', error);
    res.status(500).json({ error: 'Failed to fetch sessions by device' });
  }
});

module.exports = router;