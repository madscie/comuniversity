// backend/routes/transactions.js - NO AUTH VERSION
import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all transactions (NO AUTH - PUBLIC ACCESS)
router.get("/", async (req, res) => {
  try {
    console.log('📊 Fetching transactions with filters:', req.query);
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not available' });
    }

    const { 
      page = 1, 
      limit = 50, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      paymentMethod,
      itemType,
      status 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { itemId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    if (itemType) {
      query.itemType = itemType;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Get total count
    const total = await db.collection('transactions').countDocuments(query);
    
    // Get transactions with pagination
    const transactions = await db.collection('transactions')
      .find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Calculate totals using aggregation for better performance
    const completedPipeline = [
      { $match: { status: 'completed' } },
      { 
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          stripeRevenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentMethod', 'stripe'] }, '$amount', 0]
            }
          },
          paypalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentMethod', 'paypal'] }, '$amount', 0]
            }
          },
          articleCount: {
            $sum: {
              $cond: [{ $eq: ['$itemType', 'article'] }, 1, 0]
            }
          },
          bookCount: {
            $sum: {
              $cond: [{ $eq: ['$itemType', 'book'] }, 1, 0]
            }
          }
        }
      }
    ];

    const statsResult = await db.collection('transactions').aggregate(completedPipeline).toArray();
    const stats = statsResult[0] || {
      totalRevenue: 0,
      stripeRevenue: 0,
      paypalRevenue: 0,
      articleCount: 0,
      bookCount: 0
    };
    
    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStatsPipeline = [
      { 
        $match: {
          createdAt: { $gte: today },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: '$amount' },
          todayCount: { $sum: 1 }
        }
      }
    ];

    const todayStats = await db.collection('transactions').aggregate(todayStatsPipeline).toArray();
    const todayData = todayStats[0] || { todayRevenue: 0, todayCount: 0 };

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalRevenue: stats.totalRevenue || 0,
        totalTransactions: total,
        todayCount: todayData.todayCount || 0,
        todayRevenue: todayData.todayRevenue || 0,
        stripeRevenue: stats.stripeRevenue || 0,
        paypalRevenue: stats.paypalRevenue || 0,
        articleCount: stats.articleCount || 0,
        bookCount: stats.bookCount || 0
      }
    });
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction statistics (NO AUTH)
router.get("/stats/overview", async (req, res) => {
  try {
    console.log('📈 Fetching transaction stats');
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not available' });
    }

    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    // Main stats aggregation
    const statsPipeline = [
      { $match: dateFilter },
      {
        $facet: {
          overallStats: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
                totalTransactions: { $sum: 1 },
                stripeRevenue: {
                  $sum: {
                    $cond: [
                      { $and: [
                        { $eq: ['$paymentMethod', 'stripe'] },
                        { $eq: ['$status', 'completed'] }
                      ]}, 
                      '$amount', 
                      0
                    ]
                  }
                },
                paypalRevenue: {
                  $sum: {
                    $cond: [
                      { $and: [
                        { $eq: ['$paymentMethod', 'paypal'] },
                        { $eq: ['$status', 'completed'] }
                      ]}, 
                      '$amount', 
                      0
                    ]
                  }
                },
                articleCount: {
                  $sum: { $cond: [{ $eq: ['$itemType', 'article'] }, 1, 0] }
                },
                bookCount: {
                  $sum: { $cond: [{ $eq: ['$itemType', 'book'] }, 1, 0] }
                }
              }
            }
          ],
          dailyRevenue: [
            { 
              $match: { 
                status: 'completed',
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
              } 
            },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id': 1 } }
          ],
          paymentMethodStats: [
            {
              $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 },
                revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } }
              }
            }
          ]
        }
      }
    ];

    const [result] = await db.collection('transactions').aggregate(statsPipeline).toArray();
    
    const stats = result.overallStats[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      stripeRevenue: 0,
      paypalRevenue: 0,
      articleCount: 0,
      bookCount: 0
    };

    res.json({
      success: true,
      stats,
      dailyRevenue: result.dailyRevenue || [],
      paymentMethodStats: result.paymentMethodStats || []
    });
  } catch (error) {
    console.error('❌ Error fetching transaction stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction by ID (NO AUTH)
router.get("/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not available' });
    }

    const { id } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid transaction ID format' });
    }

    const transaction = await db.collection('transactions').findOne({ _id: new ObjectId(id) });
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    res.json({ success: true, transaction });
  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transactions for specific user (NO AUTH)
router.get("/user/:email", async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not available' });
    }

    const { email } = req.params;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    const transactions = await db.collection('transactions')
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('❌ Error fetching user transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CSV Export Route (NO AUTH)
router.get("/export/csv", async (req, res) => {
  try {
    console.log('📤 CSV Export Request:', req.query);
    
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not available' });
    }

    const { startDate, endDate } = req.query;
    
    // Build query
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Get all transactions for export (no pagination)
    const transactions = await db.collection('transactions')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`📊 Found ${transactions.length} transactions to export`);

    if (transactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No transactions found to export'
      });
    }

    // Create CSV headers
    const headers = [
      'Transaction ID',
      'Date',
      'User Email',
      'User ID',
      'Item Type',
      'Item ID',
      'Amount (USD)',
      'Payment Method',
      'Status',
      'Payment Status',
      'Created At',
      'Updated At'
    ];

    // Create CSV rows
    const csvRows = transactions.map(transaction => [
      transaction.transactionId || '',
      new Date(transaction.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      transaction.userEmail || '',
      transaction.userId || '',
      transaction.itemType || '',
      transaction.itemId || '',
      `$${(transaction.amount || 0).toFixed(2)}`,
      transaction.paymentMethod || '',
      transaction.status || '',
      transaction.paymentStatus || '',
      new Date(transaction.createdAt).toISOString(),
      new Date(transaction.updatedAt || transaction.createdAt).toISOString()
    ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','));

    // Combine headers and rows
    const csvContent = [
      headers.map(header => `"${header}"`).join(','),
      ...csvRows
    ].join('\n');

    // Set response headers for file download
    const filename = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
    
    console.log(`✅ CSV export successful: ${filename} (${transactions.length} records)`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('❌ Error exporting transactions to CSV:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export transactions',
      message: error.message 
    });
  }
});

// REMOVE THESE PROTECTED ROUTES OR MODIFY THEM
// Update transaction status (KEEP PROTECTED or remove)
router.patch("/:id/status", async (req, res) => {
  try {
    // Keep this protected or remove it entirely
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required for this action' 
    });
    
    // If you want to keep it working:
    // const authCheck = await verifyAdminToken(req);
    // if (!authCheck.success) {
    //   return res.status(401).json(authCheck);
    // }

    // ... rest of the code
  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;