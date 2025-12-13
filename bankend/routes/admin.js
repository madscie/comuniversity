// routes/clerkSync.js
import express from "express";
import { ObjectId } from "mongodb";
import axios from "axios";

const router = express.Router();

// Sync Clerk users with MongoDB
router.post('/users/sync-clerk', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection('users');
    
    // Get Clerk API key from environment
    const clerkApiKey = process.env.CLERK_SECRET_KEY;
    
    if (!clerkApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Clerk API key not configured'
      });
    }

    // Get users from Clerk API
    const response = await axios.get('https://api.clerk.com/v1/users', {
      headers: {
        'Authorization': `Bearer ${clerkApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const clerkUsers = response.data;
    const syncedUsers = [];
    
    // Sync each Clerk user with MongoDB
    for (const clerkUser of clerkUsers) {
      const primaryEmail = clerkUser.email_addresses?.find(email => email.id === clerkUser.primary_email_address_id);
      const email = primaryEmail?.email_address || clerkUser.email_addresses?.[0]?.email_address;
      
      if (!email) continue; // Skip users without email
      
      const userData = {
        clerkId: clerkUser.id,
        name: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || 
              email.split('@')[0] || 'User',
        email: email,
        profile_image: clerkUser.profile_image_url,
        is_active: !clerkUser.banned,
        email_verified: primaryEmail?.verification?.status === 'verified',
        last_login: clerkUser.last_sign_in_at,
        created_at: clerkUser.created_at,
        updated_at: new Date(),
        role: 'user', // Default role
        affiliate_status: 'not_applied',
        total_referrals: 0,
        total_earnings: 0,
        bio: '',
        sign_in_methods: clerkUser.sso_connections || []
      };
      
      // Upsert user (update if exists, insert if not)
      const result = await usersCollection.updateOne(
        { clerkId: clerkUser.id },
        { $set: userData },
        { upsert: true }
      );
      
      syncedUsers.push({
        id: clerkUser.id,
        email: email,
        name: userData.name,
        action: result.upsertedId ? 'created' : 'updated'
      });
    }
    
    // Get total count after sync
    const totalUsers = await usersCollection.countDocuments();
    
    res.json({
      success: true,
      message: `Synced ${syncedUsers.length} users from Clerk`,
      synced: syncedUsers,
      totalUsers: totalUsers
    });
    
  } catch (error) {
    console.error('❌ Clerk sync error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error syncing users from Clerk',
      error: error.message
    });
  }
});

// Get all users (with optional search/filter)
router.get('/users', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { search, role, status, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add role filter
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Add status filter
    if (status && status !== 'all') {
      query.is_active = status === 'active';
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await db.collection('users')
      .find(query)
      .project({
        clerkId: 1,
        name: 1,
        email: 1,
        role: 1,
        is_active: 1,
        affiliate_status: 1,
        total_referrals: 1,
        total_earnings: 1,
        profile_image: 1,
        created_at: 1,
        updated_at: 1,
        last_login: 1
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await db.collection('users').countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit))
        }
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

export default router;






