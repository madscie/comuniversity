import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const db = req.app.locals.db; // Assuming you set up db connection in app.js
    
    // MongoDB aggregation to get counts
    const [
      booksCount,
      usersCount,
      articlesCount,
      webinarsCount,
      affiliatesCount
    ] = await Promise.all([
      db.collection('books').countDocuments(),
      db.collection('users').countDocuments(),
      db.collection('articles').countDocuments(),
      db.collection('webinars').countDocuments(),
      db.collection('affiliates').countDocuments({ status: 'approved' })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks: booksCount,
          totalUsers: usersCount,
          totalArticles: articlesCount,
          totalWebinars: webinarsCount,
          activeAffiliates: affiliatesCount,
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
    const db = req.app.locals.db;
    
    const users = await db.collection('users')
      .find({})
      .project({
        _id: 1,
        id: 1,
        name: 1,
        email: 1,
        role: 1,
        is_active: 1,
        affiliate_status: 1,
        total_referrals: 1,
        total_earnings: 1,
        join_date: 1,
        last_login: 1,
        bio: 1,
        profile_image: 1,
        created_at: 1,
        updated_at: 1
      })
      .sort({ created_at: -1 })
      .toArray();

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          ...user,
          id: user._id, // Keep id field for frontend compatibility
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
    const db = req.app.locals.db;

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update object
    const updateFields = {};
    
    if (role !== undefined) {
      updateFields.role = role;
    }

    if (is_active !== undefined) {
      updateFields.is_active = Boolean(is_active);
    }

    if (affiliate_status !== undefined) {
      updateFields.affiliate_status = affiliate_status;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Add updated timestamp
    updateFields.updated_at = new Date();

    // Update user
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    // Get updated user
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          is_active: 1,
          affiliate_status: 1
        }
      }
    );

    console.log(`✅ User updated: ID ${id}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          ...updatedUser,
          id: updatedUser._id // Map _id to id for frontend compatibility
        }
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