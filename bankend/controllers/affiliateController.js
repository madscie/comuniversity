const db = require('../config/database');
const crypto = require('crypto');

exports.applyForAffiliate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { motivation, promotionChannels } = req.body;

    // Check if already applied
    const [existing] = await db.execute(
      'SELECT id FROM affiliates WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already applied for affiliate program'
      });
    }

    // Create affiliate application
    await db.execute(
      `INSERT INTO affiliates (user_id, motivation, promotion_channels, status)
       VALUES (?, ?, ?, 'pending')`,
      [userId, motivation, JSON.stringify(promotionChannels)]
    );

    // Update user affiliate status
    await db.execute(
      'UPDATE users SET affiliate_status = "pending" WHERE id = ?',
      [userId]
    );

    res.json({
      status: 'success',
      message: 'Affiliate application submitted successfully'
    });
  } catch (error) {
    console.error('Affiliate application error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.getAffiliateStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [affiliates] = await db.execute(
      `SELECT a.*, u.name, u.email
       FROM affiliates a
       JOIN users u ON a.user_id = u.id
       WHERE a.user_id = ?`,
      [userId]
    );

    if (affiliates.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Affiliate not found'
      });
    }

    const affiliate = affiliates[0];

    // Get referral stats
    const [referrals] = await db.execute(
      `SELECT COUNT(*) as total_referrals,
              SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_referrals
       FROM affiliate_referrals 
       WHERE affiliate_id = ?`,
      [affiliate.id]
    );

    const stats = referrals[0];

    res.json({
      status: 'success',
      data: {
        affiliate: {
          ...affiliate,
          totalReferrals: stats.total_referrals,
          approvedReferrals: stats.approved_referrals,
          conversionRate: stats.total_referrals > 0 
            ? Math.round((stats.approved_referrals / stats.total_referrals) * 100)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get affiliate stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.getAffiliateReferrals = async (req, res) => {
  try {
    const userId = req.user.id;

    const [affiliates] = await db.execute(
      'SELECT id FROM affiliates WHERE user_id = ?',
      [userId]
    );

    if (affiliates.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Affiliate not found'
      });
    }

    const affiliateId = affiliates[0].id;

    const [referrals] = await db.execute(
      `SELECT ar.*, u.name as referred_user_name, u.email as referred_user_email,
              u.join_date as referred_user_join_date
       FROM affiliate_referrals ar
       JOIN users u ON ar.referred_user_id = u.id
       WHERE ar.affiliate_id = ?
       ORDER BY ar.referral_date DESC`,
      [affiliateId]
    );

    res.json({
      status: 'success',
      data: { referrals }
    });
  } catch (error) {
    console.error('Get affiliate referrals error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.generateAffiliateCode = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is approved affiliate
    const [affiliates] = await db.execute(
      'SELECT id FROM affiliates WHERE user_id = ? AND status = "approved"',
      [userId]
    );

    if (affiliates.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not an approved affiliate'
      });
    }

    // Generate unique affiliate code
    const affiliateCode = `COMM${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Update user with affiliate code
    await db.execute(
      'UPDATE users SET affiliate_code = ? WHERE id = ?',
      [affiliateCode, userId]
    );

    res.json({
      status: 'success',
      data: {
        affiliateCode
      }
    });
  } catch (error) {
    console.error('Generate affiliate code error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};