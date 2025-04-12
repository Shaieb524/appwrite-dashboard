const express = require('express');
const AppwriteService = require('../services/appwrite-service');

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await AppwriteService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error in /dashboard/stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;