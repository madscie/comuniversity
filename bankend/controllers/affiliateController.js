import crypto from 'crypto';
import { getCollection } from '../config/database.js';
import { ObjectId } from 'mongodb';

// Apply for affiliate program
export const applyForAffiliate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { motivation, promotionChannels, estimatedReferrals, website, socialMedia } = req.body;

    const usersCollection = await getCollection('users');

    // Check if already applied
    const user = await usersCollection.findOne({ _id: userId });

    if (user.affiliate && user.affiliate.status !== 'inactive') {
      return res.status(400).json({
        status: 'error',
        message: 'You have already applied for affiliate program'
      });
    }

    // Create or update affiliate application in user document
    const affiliateApplication = {
      motivation: motivation || '',
      promotionChannels: Array.isArray(promotionChannels) ? promotionChannels : [],
      estimatedReferrals: parseInt(estimatedReferrals) || 0,
      website: website || null,
      socialMedia: socialMedia || {},
      status: 'pending',
      appliedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: null
    };

    // Update user with affiliate application
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $set: { 
          affiliate: affiliateApplication,
          updatedAt: new Date()
        } 
      }
    );

    // Log affiliate application
    console.log(`📝 Affiliate application submitted by user: ${user.email}`);

    res.json({
      status: 'success',
      message: 'Affiliate application submitted successfully',
      data: {
        appliedAt: affiliateApplication.appliedAt,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Affiliate application error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get affiliate stats
export const getAffiliateStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersCollection = await getCollection('users');

    // Get user with affiliate data
    const user = await usersCollection.findOne(
      { _id: userId },
      {
        projection: {
          name: 1,
          email: 1,
          affiliate: 1,
          statistics: 1,
          _id: 0
        }
      }
    );

    if (!user || !user.affiliate) {
      return res.status(404).json({
        status: 'error',
        message: 'Affiliate not found'
      });
    }

    // Calculate referral stats from referrals array
    const referrals = user.affiliate.referrals || [];
    const totalReferrals = referrals.length;
    const approvedReferrals = referrals.filter(ref => ref.status === 'approved').length;
    const pendingReferrals = referrals.filter(ref => ref.status === 'pending').length;
    const totalEarnings = referrals.reduce((sum, ref) => sum + (ref.earnings || 0), 0);
    
    // Calculate conversion rate
    const conversionRate = totalReferrals > 0 
      ? Math.round((approvedReferrals / totalReferrals) * 100)
      : 0;

    // Calculate monthly stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyReferrals = referrals.filter(ref => {
      const refDate = new Date(ref.joinedDate);
      return refDate.getMonth() === currentMonth && refDate.getFullYear() === currentYear;
    });
    const monthlyEarnings = monthlyReferrals.reduce((sum, ref) => sum + (ref.earnings || 0), 0);

    res.json({
      status: 'success',
      data: {
        affiliate: {
          ...user.affiliate,
          name: user.name,
          email: user.email,
          totalReferrals,
          approvedReferrals,
          pendingReferrals,
          totalEarnings,
          conversionRate,
          monthlyReferrals: monthlyReferrals.length,
          monthlyEarnings,
          referralUrl: user.affiliate.code ? `https://communiversity.com/ref/${user.affiliate.code}` : null
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

// Get affiliate referrals
export const getAffiliateReferrals = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const usersCollection = await getCollection('users');

    // Get user with affiliate referrals
    const user = await usersCollection.findOne(
      { _id: userId },
      {
        projection: {
          affiliate: 1,
          _id: 0
        }
      }
    );

    if (!user || !user.affiliate) {
      return res.status(404).json({
        status: 'error',
        message: 'Affiliate not found'
      });
    }

    // Filter referrals by status if provided
    let referrals = user.affiliate.referrals || [];
    
    if (status && status !== 'all') {
      referrals = referrals.filter(ref => ref.status === status);
    }

    // Sort by joined date (newest first)
    referrals.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));

    // Apply pagination
    const paginatedReferrals = referrals.slice(skip, skip + parseInt(limit));

    res.json({
      status: 'success',
      data: { 
        referrals: paginatedReferrals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: referrals.length,
          pages: Math.ceil(referrals.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get affiliate referrals error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Generate affiliate code
export const generateAffiliateCode = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersCollection = await getCollection('users');

    // Check if user is approved affiliate
    const user = await usersCollection.findOne({ _id: userId });

    if (!user.affiliate || user.affiliate.status !== 'approved') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not an approved affiliate'
      });
    }

    // Generate unique affiliate code if not exists
    let affiliateCode = user.affiliate.code;
    
    if (!affiliateCode) {
      affiliateCode = `COMM${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      
      // Update user with affiliate code
      await usersCollection.updateOne(
        { _id: userId },
        { 
          $set: { 
            "affiliate.code": affiliateCode,
            updatedAt: new Date()
          } 
        }
      );
    }

    res.json({
      status: 'success',
      data: {
        affiliateCode,
        referralUrl: `https://communiversity.com/ref/${affiliateCode}`,
        shareableLinks: {
          website: `<a href="https://communiversity.com/ref/${affiliateCode}">Join Communiversity</a>`,
          socialMedia: `Check out Communiversity! Use my referral link: https://communiversity.com/ref/${affiliateCode}`,
          email: `Join Communiversity using my referral link: https://communiversity.com/ref/${affiliateCode}`
        }
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

// Track referral (called when new user signs up with affiliate code)
export const trackReferral = async (req, res) => {
  try {
    const { affiliateCode, referredUserId, referredUserName, referredUserEmail } = req.body;

    const usersCollection = await getCollection('users');

    // Find affiliate by code
    const affiliateUser = await usersCollection.findOne({
      "affiliate.code": affiliateCode,
      "affiliate.status": "approved"
    });

    if (!affiliateUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid affiliate code'
      });
    }

    // Create referral record in affiliate's document
    const referral = {
      userId: new ObjectId(referredUserId),
      name: referredUserName,
      email: referredUserEmail,
      joinedDate: new Date(),
      status: 'pending', // pending, approved, rejected
      earnings: 0,
      commissionRate: affiliateUser.affiliate.commissionRate || 10, // percentage
      notes: ''
    };

    // Add referral to affiliate's referrals array
    await usersCollection.updateOne(
      { _id: affiliateUser._id },
      { 
        $push: { 
          "affiliate.referrals": referral 
        },
        $inc: {
          "affiliate.totalReferrals": 1
        },
        $set: { updatedAt: new Date() }
      }
    );

    // Update referred user with affiliate info
    await usersCollection.updateOne(
      { _id: new ObjectId(referredUserId) },
      { 
        $set: { 
          "affiliate.referredBy": affiliateUser._id,
          "affiliate.referredByCode": affiliateCode,
          "affiliate.referredByName": affiliateUser.name,
          updatedAt: new Date()
        } 
      }
    );

    console.log(`👥 New referral tracked: ${referredUserName} referred by ${affiliateUser.name}`);

    res.json({
      status: 'success',
      message: 'Referral tracked successfully',
      data: {
        affiliateName: affiliateUser.name,
        referredUser: referredUserName,
        referralDate: new Date()
      }
    });
  } catch (error) {
    console.error('Track referral error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Approve/reject referral (admin function)
export const updateReferralStatus = async (req, res) => {
  try {
    const { affiliateId, referralId, status, earnings, notes } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const usersCollection = await getCollection('users');

    // Find the referral in affiliate's referrals array and update it
    const result = await usersCollection.updateOne(
      { 
        _id: new ObjectId(affiliateId),
        "affiliate.referrals.userId": new ObjectId(referralId)
      },
      { 
        $set: { 
          "affiliate.referrals.$.status": status,
          "affiliate.referrals.$.earnings": earnings || 0,
          "affiliate.referrals.$.approvedAt": status === 'approved' ? new Date() : null,
          "affiliate.referrals.$.approvedBy": req.user._id,
          "affiliate.referrals.$.notes": notes || '',
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Referral not found'
      });
    }

    // Update affiliate's total earnings if referral is approved
    if (status === 'approved' && earnings) {
      await usersCollection.updateOne(
        { _id: new ObjectId(affiliateId) },
        { 
          $inc: { 
            "affiliate.totalEarnings": earnings
          },
          $set: { updatedAt: new Date() }
        }
      );
    }

    res.json({
      status: 'success',
      message: `Referral ${status} successfully`,
      data: {
        referralId,
        status,
        earnings: earnings || 0,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Update referral status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get affiliate leaderboard
export const getAffiliateLeaderboard = async (req, res) => {
  try {
    const { period = 'month', limit = 10 } = req.query;
    const usersCollection = await getCollection('users');

    // Get all approved affiliates
    const affiliates = await usersCollection.find({
      "affiliate.status": "approved"
    }, {
      projection: {
        name: 1,
        email: 1,
        "affiliate.code": 1,
        "affiliate.totalReferrals": 1,
        "affiliate.totalEarnings": 1,
        "affiliate.referrals": 1
      }
    }).toArray();

    // Calculate stats based on period
    const leaderboard = affiliates.map(affiliate => {
      const referrals = affiliate.affiliate?.referrals || [];
      
      // Filter by period
      let periodReferrals = referrals;
      if (period === 'month') {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        periodReferrals = referrals.filter(ref => {
          const refDate = new Date(ref.joinedDate || ref.approvedAt);
          return refDate.getMonth() === currentMonth && refDate.getFullYear() === currentYear;
        });
      } else if (period === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        periodReferrals = referrals.filter(ref => {
          const refDate = new Date(ref.joinedDate || ref.approvedAt);
          return refDate >= oneWeekAgo;
        });
      }

      const periodEarnings = periodReferrals.reduce((sum, ref) => sum + (ref.earnings || 0), 0);
      const periodReferralsCount = periodReferrals.length;
      const conversionRate = referrals.length > 0 
        ? Math.round((referrals.filter(r => r.status === 'approved').length / referrals.length) * 100)
        : 0;

      return {
        name: affiliate.name,
        email: affiliate.email,
        affiliateCode: affiliate.affiliate?.code,
        totalReferrals: referrals.length,
        totalEarnings: affiliate.affiliate?.totalEarnings || 0,
        periodReferrals: periodReferralsCount,
        periodEarnings: periodEarnings,
        conversionRate: conversionRate,
        averageEarningsPerReferral: referrals.length > 0 
          ? (affiliate.affiliate?.totalEarnings || 0) / referrals.length
          : 0
      };
    });

    // Sort by period earnings (descending)
    leaderboard.sort((a, b) => b.periodEarnings - a.periodEarnings);

    // Apply limit
    const topAffiliates = leaderboard.slice(0, parseInt(limit));

    res.json({
      status: 'success',
      data: {
        leaderboard: topAffiliates,
        period: period,
        totalAffiliates: affiliates.length
      }
    });
  } catch (error) {
    console.error('Get affiliate leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Withdraw affiliate earnings
export const withdrawEarnings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, paymentMethod, accountDetails } = req.body;

    const usersCollection = await getCollection('users');

    // Get user with affiliate data
    const user = await usersCollection.findOne({ _id: userId });

    if (!user.affiliate || user.affiliate.status !== 'approved') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not an approved affiliate'
      });
    }

    const availableBalance = user.affiliate.totalEarnings || 0;
    const pendingWithdrawals = user.affiliate.pendingWithdrawals || 0;
    const withdrawableBalance = availableBalance - pendingWithdrawals;

    if (amount > withdrawableBalance) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient balance. Available: $${withdrawableBalance}`
      });
    }

    if (amount < 10) { // Minimum withdrawal amount
      return res.status(400).json({
        status: 'error',
        message: 'Minimum withdrawal amount is $10'
      });
    }

    // Create withdrawal request
    const withdrawal = {
      withdrawalId: `WD-${Date.now().toString().slice(-8)}`,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod,
      accountDetails: accountDetails,
      status: 'pending',
      requestedAt: new Date(),
      processedAt: null,
      processedBy: null,
      transactionId: null,
      notes: ''
    };

    // Add withdrawal to affiliate's withdrawals array
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $push: { 
          "affiliate.withdrawals": withdrawal 
        },
        $inc: {
          "affiliate.pendingWithdrawals": parseFloat(amount)
        },
        $set: { updatedAt: new Date() }
      }
    );

    // Add to transactions collection for better tracking
    const transactionsCollection = await getCollection('transactions');
    const transaction = {
      transactionId: `AFF-WD-${Date.now().toString().slice(-8)}`,
      type: 'affiliate_withdrawal',
      status: 'pending',
      user: {
        userId: userId,
        name: user.name,
        email: user.email
      },
      amount: parseFloat(amount),
      currency: 'usd',
      payment: {
        method: paymentMethod,
        accountDetails: accountDetails,
        status: 'pending'
      },
      notes: 'Affiliate earnings withdrawal',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await transactionsCollection.insertOne(transaction);

    res.json({
      status: 'success',
      message: 'Withdrawal request submitted successfully',
      data: {
        withdrawalId: withdrawal.withdrawalId,
        amount: amount,
        status: 'pending',
        requestedAt: withdrawal.requestedAt,
        estimatedProcessing: '3-5 business days'
      }
    });
  } catch (error) {
    console.error('Withdraw earnings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};