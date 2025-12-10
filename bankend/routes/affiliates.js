import express from "express";
import { authMiddleware } from '../middleware/auth.js';
import { ObjectId } from "mongodb";

const router = express.Router();

// All affiliate routes require authentication
router.use(authMiddleware);

// GET /api/affiliates
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Example: Get all affiliates with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const affiliates = await db.collection('affiliates')
      .find({})
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .toArray();
    
    const total = await db.collection('affiliates').countDocuments();
    
    res.json({ 
      success: true,
      data: {
        affiliates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Get affiliates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching affiliates'
    });
  }
});

// GET /api/affiliates/status
router.get('/status', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.id; // Assuming auth middleware adds user to req
    
    // Check if user is an affiliate
    const affiliate = await db.collection('affiliates').findOne({
      user_id: new ObjectId(userId)
    });
    
    if (!affiliate) {
      return res.json({
        success: true,
        data: {
          isAffiliate: false,
          message: 'You are not registered as an affiliate'
        }
      });
    }
    
    // Get affiliate stats
    const referrals = await db.collection('users').countDocuments({
      referred_by: new ObjectId(userId)
    });
    
    res.json({ 
      success: true,
      data: {
        isAffiliate: true,
        status: affiliate.status,
        affiliateSince: affiliate.created_at,
        totalReferrals: referrals,
        totalEarnings: affiliate.total_earnings || 0,
        pendingEarnings: affiliate.pending_earnings || 0,
        affiliateCode: affiliate.code,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        }
      }
    });
  } catch (error) {
    console.error('❌ Get affiliate status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching affiliate status'
    });
  }
});

// POST /api/affiliates/apply (example additional route)
router.post('/apply', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const { reason } = req.body;
    
    // Check if already applied
    const existingApplication = await db.collection('affiliates').findOne({
      user_id: new ObjectId(userId)
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for affiliate program'
      });
    }
    
    // Generate unique affiliate code
    const affiliateCode = 'AFF' + Math.random().toString(36).substr(2, 8).toUpperCase();
    
    // Create affiliate application
    const newAffiliate = {
      user_id: new ObjectId(userId),
      code: affiliateCode,
      status: 'pending',
      reason: reason,
      total_earnings: 0,
      pending_earnings: 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('affiliates').insertOne(newAffiliate);
    
    res.status(201).json({
      success: true,
      message: 'Affiliate application submitted successfully',
      data: {
        applicationId: result.insertedId,
        affiliateCode: affiliateCode
      }
    });
  } catch (error) {
    console.error('❌ Apply affiliate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application'
    });
  }
});

export default router;