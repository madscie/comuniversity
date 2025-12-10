import stripePackage from 'stripe';
import { getCollection } from '../config/database.js';
import { ObjectId } from 'mongodb';

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

// Create payment intent for book purchase
export const createPaymentIntent = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id; // MongoDB _id

    const booksCollection = await getCollection('books');
    const transactionsCollection = await getCollection('transactions');
    const paymentsCollection = await getCollection('payments');

    // Get book details
    const book = await booksCollection.findOne({
      _id: new ObjectId(bookId),
      "availability.status": "available"
    });

    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found or not available'
      });
    }

    const bookPrice = book.price || 0;
    
    // Check if book is free
    if (bookPrice === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'This book is free. No payment required.'
      });
    }

    // Check if user already has access to this book
    const existingAccess = await transactionsCollection.findOne({
      "user.userId": userId,
      "book.bookId": new ObjectId(bookId),
      type: "purchase",
      status: "completed",
      $or: [
        { "dates.expiresAt": null },
        { "dates.expiresAt": { $gt: new Date() } }
      ]
    });

    if (existingAccess) {
      return res.status(400).json({
        status: 'error',
        message: 'You already have access to this book'
      });
    }

    // Create Stripe customer if doesn't exist
    let stripeCustomerId = req.user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: userId.toString(),
          userEmail: req.user.email
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      const usersCollection = await getCollection('users');
      await usersCollection.updateOne(
        { _id: userId },
        { $set: { stripeCustomerId: customer.id } }
      );
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(bookPrice * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        userId: userId.toString(),
        bookId: bookId,
        bookTitle: book.title,
        bookAuthors: JSON.stringify(book.authors),
        bookISBN: book.isbn || '',
        bookCategory: book.category || ''
      },
      description: `Purchase: ${book.title}`,
      shipping: {
        name: req.user.name,
        address: {
          line1: req.user.shippingAddress?.line1 || '',
          line2: req.user.shippingAddress?.line2 || '',
          city: req.user.shippingAddress?.city || '',
          state: req.user.shippingAddress?.state || '',
          postal_code: req.user.shippingAddress?.postalCode || '',
          country: req.user.shippingAddress?.country || 'US'
        }
      }
    });

    // Create payment record in MongoDB
    const paymentRecord = {
      paymentId: `PAY-${Date.now().toString().slice(-8)}`,
      userId: userId,
      userEmail: req.user.email,
      userName: req.user.name,
      bookId: new ObjectId(bookId),
      bookTitle: book.title,
      bookAuthors: book.authors,
      bookISBN: book.isbn,
      amount: bookPrice,
      currency: 'usd',
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: stripeCustomerId,
      status: 'pending',
      paymentMethod: 'stripe',
      metadata: {
        bookCategory: book.category,
        bookFormat: book.format,
        deweyDecimal: book.deweyDecimal
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes expiry
    };

    await paymentsCollection.insertOne(paymentRecord);

    // Create pending transaction record
    const transactionRecord = {
      transactionId: `TXN-${Date.now().toString().slice(-8)}`,
      type: 'purchase',
      status: 'pending',
      user: {
        userId: userId,
        name: req.user.name,
        email: req.user.email,
        stripeCustomerId: stripeCustomerId
      },
      book: {
        bookId: new ObjectId(bookId),
        title: book.title,
        authors: book.authors,
        isbn: book.isbn,
        deweyDecimal: book.deweyDecimal,
        price: bookPrice,
        category: book.category
      },
      payment: {
        paymentId: paymentRecord.paymentId,
        stripePaymentIntentId: paymentIntent.id,
        amount: bookPrice,
        currency: 'usd',
        status: 'pending'
      },
      dates: {
        initiatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await transactionsCollection.insertOne(transactionRecord);

    res.json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: paymentRecord.paymentId,
        transactionId: transactionRecord.transactionId,
        amount: bookPrice,
        currency: 'usd',
        bookTitle: book.title,
        expiresAt: paymentRecord.expiresAt
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    
    // Handle specific Stripe errors
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.type === 'StripeCardError') {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid payment request';
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage
    });
  }
};

// Verify and complete payment
export const verifyPayment = async (req, res) => {
  try {
    const { paymentIntentId, transactionId } = req.body;
    const userId = req.user._id;

    const paymentsCollection = await getCollection('payments');
    const transactionsCollection = await getCollection('transactions');
    const booksCollection = await getCollection('books');

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        status: 'error',
        message: `Payment not completed. Status: ${paymentIntent.status}`
      });
    }

    // Find payment record
    const payment = await paymentsCollection.findOne({
      stripePaymentIntentId: paymentIntentId,
      userId: userId,
      status: 'pending'
    });

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment record not found or already processed'
      });
    }

    // Check if payment has expired
    if (payment.expiresAt && payment.expiresAt < new Date()) {
      await paymentsCollection.updateOne(
        { _id: payment._id },
        { $set: { status: 'expired', updatedAt: new Date() } }
      );
      
      return res.status(400).json({
        status: 'error',
        message: 'Payment session has expired'
      });
    }

    // Update payment status
    await paymentsCollection.updateOne(
      { _id: payment._id },
      { 
        $set: { 
          status: 'completed',
          completedAt: new Date(),
          stripePaymentMethod: paymentIntent.payment_method,
          stripePaymentMethodType: paymentIntent.payment_method_types?.[0],
          stripeChargeId: paymentIntent.latest_charge,
          updatedAt: new Date()
        } 
      }
    );

    // Update transaction status
    await transactionsCollection.updateOne(
      { transactionId: transactionId || payment.paymentId.replace('PAY-', 'TXN-') },
      { 
        $set: { 
          status: 'completed',
          "payment.status": 'completed',
          "payment.stripeChargeId": paymentIntent.latest_charge,
          "payment.completedAt": new Date(),
          "dates.completedAt": new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Create completed transaction record (for access tracking)
    const completedTransaction = {
      transactionId: `COMP-${Date.now().toString().slice(-8)}`,
      type: 'purchase',
      status: 'completed',
      user: {
        userId: userId,
        name: req.user.name,
        email: req.user.email,
        stripeCustomerId: payment.stripeCustomerId
      },
      book: {
        bookId: payment.bookId,
        title: payment.bookTitle,
        authors: payment.bookAuthors,
        isbn: payment.bookISBN,
        price: payment.amount,
        category: payment.metadata?.bookCategory
      },
      payment: {
        paymentId: payment.paymentId,
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.latest_charge,
        amount: payment.amount,
        currency: payment.currency,
        status: 'completed',
        completedAt: new Date()
      },
      dates: {
        purchaseDate: new Date(),
        // Permanent access for purchases
        expiresAt: null
      },
      access: {
        granted: true,
        type: 'permanent',
        downloadLimit: 10, // Allow 10 downloads
        downloadsUsed: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await transactionsCollection.insertOne(completedTransaction);

    // Update user's purchase history
    const usersCollection = await getCollection('users');
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $push: { 
          purchaseHistory: {
            transactionId: completedTransaction.transactionId,
            bookId: payment.bookId,
            bookTitle: payment.bookTitle,
            amount: payment.amount,
            purchasedAt: new Date(),
            paymentMethod: 'stripe'
          }
        },
        $inc: { 
          "statistics.totalSpent": payment.amount,
          "statistics.booksPurchased": 1
        }
      }
    );

    // Update book statistics
    await booksCollection.updateOne(
      { _id: payment.bookId },
      { 
        $inc: { 
          "statistics.totalPurchases": 1,
          "statistics.totalRevenue": payment.amount
        },
        $push: {
          recentPurchases: {
            userId: userId,
            userName: req.user.name,
            purchasedAt: new Date(),
            amount: payment.amount
          }
        }
      }
    );

    // Send confirmation email (you would integrate with your email service)
    // await sendPurchaseConfirmationEmail(req.user.email, payment.bookTitle, payment.amount);

    res.json({
      status: 'success',
      message: 'Payment verified successfully',
      data: {
        transactionId: completedTransaction.transactionId,
        paymentId: payment.paymentId,
        bookId: payment.bookId,
        bookTitle: payment.bookTitle,
        amount: payment.amount,
        currency: payment.currency,
        purchasedAt: new Date(),
        accessGranted: true,
        downloadToken: `DL-${Date.now().toString().slice(-8)}` // Optional: generate immediate download token
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const paymentsCollection = await getCollection('payments');
    const transactionsCollection = await getCollection('transactions');

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Update payment status
        await paymentsCollection.updateOne(
          { stripePaymentIntentId: paymentIntent.id },
          { 
            $set: { 
              status: 'completed',
              completedAt: new Date(),
              stripePaymentMethod: paymentIntent.payment_method,
              stripeChargeId: paymentIntent.latest_charge,
              updatedAt: new Date()
            } 
          }
        );

        // Update related transaction
        await transactionsCollection.updateOne(
          { "payment.stripePaymentIntentId": paymentIntent.id },
          { 
            $set: { 
              status: 'completed',
              "payment.status": 'completed',
              "payment.stripeChargeId": paymentIntent.latest_charge,
              "payment.completedAt": new Date(),
              "dates.completedAt": new Date(),
              updatedAt: new Date()
            } 
          }
        );

        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        await paymentsCollection.updateOne(
          { stripePaymentIntentId: failedPayment.id },
          { 
            $set: { 
              status: 'failed',
              failureMessage: failedPayment.last_payment_error?.message,
              updatedAt: new Date()
            } 
          }
        );

        await transactionsCollection.updateOne(
          { "payment.stripePaymentIntentId": failedPayment.id },
          { 
            $set: { 
              status: 'failed',
              "payment.status": 'failed',
              "payment.failureMessage": failedPayment.last_payment_error?.message,
              updatedAt: new Date()
            } 
          }
        );

        console.log(`Payment failed: ${failedPayment.id}`);
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object;
        
        await paymentsCollection.updateOne(
          { stripePaymentIntentId: canceledPayment.id },
          { 
            $set: { 
              status: 'canceled',
              updatedAt: new Date()
            } 
          }
        );

        console.log(`Payment canceled: ${canceledPayment.id}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Webhook handler error'
    });
  }
};

// Get payment history for user
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const paymentsCollection = await getCollection('payments');

    // Build query
    const query = { userId: userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const paymentsCursor = paymentsCollection.find(query, {
      projection: {
        paymentId: 1,
        bookId: 1,
        bookTitle: 1,
        bookAuthors: 1,
        amount: 1,
        currency: 1,
        status: 1,
        paymentMethod: 1,
        stripePaymentIntentId: 1,
        createdAt: 1,
        completedAt: 1,
        expiresAt: 1
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const payments = await paymentsCursor.toArray();
    const total = await paymentsCollection.countDocuments(query);

    // Calculate totals
    const totalSpent = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingPayments = payments.filter(p => p.status === 'pending').length;

    res.json({
      status: 'success',
      data: {
        payments: payments,
        summary: {
          totalPayments: total,
          completedPayments: payments.filter(p => p.status === 'completed').length,
          pendingPayments: pendingPayments,
          failedPayments: payments.filter(p => p.status === 'failed').length,
          totalSpent: totalSpent
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Refund payment (admin function)
export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const paymentsCollection = await getCollection('payments');

    // Get payment details
    const payment = await paymentsCollection.findOne({
      paymentId: paymentId,
      status: 'completed'
    });

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found or not completed'
      });
    }

    // Process refund through Stripe
    let refund;
    try {
      refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: Math.round(payment.amount * 100), // Convert to cents
        reason: 'requested_by_customer'
      });
    } catch (stripeError) {
      console.error('Stripe refund error:', stripeError);
      return res.status(400).json({
        status: 'error',
        message: `Refund failed: ${stripeError.message}`
      });
    }

    // Update payment status
    await paymentsCollection.updateOne(
      { paymentId: paymentId },
      { 
        $set: { 
          status: 'refunded',
          refundId: refund.id,
          refundedAt: new Date(),
          refundAmount: payment.amount,
          updatedAt: new Date()
        } 
      }
    );

    // Update related transaction
    const transactionsCollection = await getCollection('transactions');
    await transactionsCollection.updateOne(
      { "payment.paymentId": paymentId },
      { 
        $set: { 
          status: 'refunded',
          "payment.refundId": refund.id,
          "payment.refundedAt": new Date(),
          "dates.refundedAt": new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Revoke user access (optional - you might want to keep access)
    // await revokeBookAccess(payment.userId, payment.bookId);

    res.json({
      status: 'success',
      message: 'Payment refunded successfully',
      data: {
        refundId: refund.id,
        paymentId: paymentId,
        amountRefunded: payment.amount,
        refundStatus: refund.status
      }
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const paymentsCollection = await getCollection('payments');

    const query = { paymentId: paymentId };
    
    // Users can only see their own payments unless admin
    if (req.user.role !== 'admin') {
      query.userId = userId;
    }

    const payment = await paymentsCollection.findOne(query);

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    // Get additional details from Stripe if available
    let stripeDetails = null;
    if (payment.stripePaymentIntentId) {
      try {
        stripeDetails = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      } catch (stripeError) {
        console.error('Error fetching Stripe details:', stripeError);
      }
    }

    res.json({
      status: 'success',
      data: {
        payment: payment,
        stripeDetails: stripeDetails
      }
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};