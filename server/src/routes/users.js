const express = require('express');
const AppwriteService = require('../services/appwrite-service');

const router = express.Router();

// Get user count
router.get('/count', async (req, res) => {
  try {
    const count = await AppwriteService.getUserCount();
    res.json({ total: count });
  } catch (error) {
    console.error('Error in /users/count:', error);
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
});

// Get recent users
router.get('/recent', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const users = await AppwriteService.getRecentUsers(limit);
    res.json({ users });
  } catch (error) {
    console.error('Error in /users/recent:', error);
    res.status(500).json({ error: 'Failed to fetch recent users' });
  }
});

// Get user growth over time
router.get('/growth', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const data = await AppwriteService.getUsersOverTime(days);
    res.json({ data });
  } catch (error) {
    console.error('Error in /users/growth:', error);
    res.status(500).json({ error: 'Failed to fetch user growth data' });
  }
});

module.exports = router;