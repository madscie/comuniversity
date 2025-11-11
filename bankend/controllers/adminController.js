const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        stats: {
          totalBooks: 0,
          totalUsers: 0,
          totalArticles: 0,
          activeAffiliates: 0,
          monthlyRevenue: 0,
          pendingReviews: 0
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
