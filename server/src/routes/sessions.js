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

// Get sessions by location
router.get('/by-location', async (req, res) => {
  try {
    const data = await AppwriteService.getSessionsByLocation();
    res.json({ data });
  } catch (error) {
    console.error('Error in /sessions/by-location:', error);
    res.status(500).json({ error: 'Failed to fetch sessions by location' });
  }
});

// Get sessions by time
router.get('/by-time', async (req, res) => {
  try {
    const data = await AppwriteService.getSessionsByTime();
    res.json({ data });
  } catch (error) {
    console.error('Error in /sessions/by-time:', error);
    res.status(500).json({ error: 'Failed to fetch sessions by time' });
  }
});

// Get detailed information for a specific session
router.get('/details/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionDetails = await AppwriteService.getSessionDetails(sessionId);
    res.json(sessionDetails);
  } catch (error) {
    console.error('Error in /sessions/details:', error);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
});

module.exports = router;