import express from "express";
import db from "../config/database.js";

const router = express.Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [booksCount] = await db.execute('SELECT COUNT(*) as total FROM books');
    const [usersCount] = await db.execute('SELECT COUNT(*) as total FROM users');
    const [articlesCount] = await db.execute('SELECT COUNT(*) as total FROM articles');
    const [webinarsCount] = await db.execute('SELECT COUNT(*) as total FROM webinars');
    const [affiliatesCount] = await db.execute('SELECT COUNT(*) as total FROM affiliates WHERE status = "approved"');

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks: booksCount[0].total,
          totalUsers: usersCount[0].total,
          totalArticles: articlesCount[0].total,
          totalWebinars: webinarsCount[0].total,
          activeAffiliates: affiliatesCount[0].total,
          monthlyRevenue: 0,
          pendingReviews: 0
        },
        recentActivity: []
      }
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// Users management
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT 
        id, name, email, role, is_active, 
        affiliate_status, total_referrals, total_earnings,
        join_date, last_login, bio, profile_image,
        created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          ...user,
          is_active: Boolean(user.is_active)
        }))
      }
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active, affiliate_status } = req.body;

    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updates = [];
    const values = [];

    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(Boolean(is_active));
    }

    if (affiliate_status !== undefined) {
      updates.push('affiliate_status = ?');
      values.push(affiliate_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(id);

    const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);

    const [users] = await db.execute(
      'SELECT id, name, email, role, is_active, affiliate_status FROM users WHERE id = ?',
      [id]
    );

    console.log(`✅ User updated: ID ${id}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user: ' + error.message
    });
  }
});

export default router;