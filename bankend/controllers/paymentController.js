// backend/controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const paypalClient = require('../config/paypal');
const User = require('../models/User');

// Stripe payment - Creates checkout session for redirect
const stripePayment = async (req, res) => {
  try {
    console.log('💳 STRIPE PAYMENT REQUEST:', req.body);
    
    const { amount, articleId, email, successUrl, cancelUrl, type = 'article' } = req.body;

    // Validate required fields
    if (!amount || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        required: ['amount', 'email']
      });
    }

    // Determine product name based on type
    let productName = 'Purchase';
    if (type === 'article') {
      productName = `Article: ${articleId || 'Premium Content'}`;
    } else if (type === 'book') {
      productName = `Book: ${articleId || 'Digital Book'}`;
    }

    console.log(`Creating Stripe checkout for ${email}, amount: $${amount}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: productName,
            description: `${type.charAt(0).toUpperCase() + type.slice(1)} Purchase`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&item_id=${articleId || 'item'}&email=${encodeURIComponent(email)}&type=${type}&payment_method=stripe`,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        itemId: articleId || 'general',
        email: email,
        type: type
      }
    });

    console.log('✅ Stripe session created:', session.id);

    res.json({ 
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ STRIPE ERROR:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment processing failed',
      message: error.message
    });
  }
};

// PayPal payment
const paypalPayment = async (req, res) => {
  try {
    console.log('💳 PAYPAL PAYMENT REQUEST:', req.body);
    
    const { amount, articleId, email, successUrl, cancelUrl, type = 'article' } = req.body;

    // Validate required fields
    if (!amount || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        required: ['amount', 'email']
      });
    }

    // Determine product name
    let productName = 'Purchase';
    if (type === 'article') {
      productName = `Article: ${articleId || 'Premium Content'}`;
    } else if (type === 'book') {
      productName = `Book: ${articleId || 'Digital Book'}`;
    }

    console.log(`Creating PayPal order for ${email}, amount: $${amount}`);

    // Create PayPal order using the SDK
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    
    // ✅ FIX: Add custom_id to track the article ID
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { 
          currency_code: 'USD', 
          value: amount.toString()
        },
        description: productName,
        custom_id: `${type}_${articleId || 'item'}`, // Store article ID here
        invoice_id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }],
      application_context: {
        // ✅ FIX: Use PayPal's {ORDER_ID} placeholder
        return_url: `${successUrl}?item_id=${articleId || 'item'}&email=${encodeURIComponent(email)}&type=${type}&payment_method=paypal&order_id={ORDER_ID}`,
        cancel_url: cancelUrl,
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        brand_name: 'Communiversity',
        landing_page: 'BILLING' // Better for purchases than LOGIN
      },
    });

    console.log('Executing PayPal request...');
    const response = await paypalClient.execute(request);
    console.log('✅ PayPal order created:', response.result.id);

    // Find approval URL
    const approvalLink = response.result.links.find(link => link.rel === 'approve');
    if (!approvalLink) {
      throw new Error('No approval link found in PayPal response');
    }

    console.log('PayPal approval URL:', approvalLink.href);

    res.json({ 
      success: true,
      url: approvalLink.href,
      orderId: response.result.id
    });

  } catch (error) {
    console.error('❌ PAYPAL ERROR:', error);
    console.error('Error details:', error.response?.result || error.message);
    
    res.status(500).json({ 
      success: false,
      error: 'PayPal payment failed',
      message: error.message,
      details: error.response?.result || 'No additional details'
    });
  }
};

// PayPal webhook handler for automatic payment capture
const paypalWebhook = async (req, res) => {
  try {
    console.log('🔔 PAYPAL WEBHOOK RECEIVED:', req.body);
    
    const event = req.body;
    
    // Handle order approval/completion
    if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || 
        event.event_type === 'CHECKOUT.ORDER.COMPLETED') {
      
      const orderId = event.resource.id;
      const payerEmail = event.resource.payer?.email_address;
      const amount = event.resource.purchase_units[0]?.amount?.value;
      const customId = event.resource.purchase_units[0]?.custom_id;
      
      console.log(`PayPal order ${orderId} - Payer: ${payerEmail}, Amount: $${amount}`);
      
      // Extract article ID from custom_id (format: "type_id")
      let articleId = null;
      let itemType = 'article';
      
      if (customId) {
        const parts = customId.split('_');
        if (parts.length >= 2) {
          itemType = parts[0];
          articleId = parts[1];
        }
      }
      
      // Auto-capture the payment if APPROVED
      if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
        try {
          const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
          const captureResponse = await paypalClient.execute(captureRequest);
          console.log(`✅ Payment captured for order ${orderId}`);
        } catch (captureError) {
          console.error('Capture error:', captureError);
        }
      }
      
      // Add to user's purchases
      if (payerEmail && articleId && articleId !== 'item') {
        await addToUserLibrary(payerEmail, articleId, itemType, 'paypal', orderId, amount);
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ PayPal webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to add items to user library
const addToUserLibrary = async (email, itemId, type, paymentMethod, transactionId, amount) => {
  try {
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        email: email,
        name: email.split('@')[0],
        password: 'guest_' + Math.random().toString(36).substr(2, 9),
        purchasedArticles: [],
        purchasedBooks: []
      });
      await user.save();
      console.log(`👤 Created new user for: ${email}`);
    }

    // Add item based on type
    if (type === 'article') {
      // Check if already purchased
      const alreadyOwned = user.purchasedArticles?.some(
        purchase => purchase.articleId === itemId
      );
      
      if (!alreadyOwned) {
        user.purchasedArticles = user.purchasedArticles || [];
        user.purchasedArticles.push({
          articleId: itemId,
          purchaseDate: new Date(),
          paymentMethod: paymentMethod,
          transactionId: transactionId,
          amount: amount || 0
        });
        await user.save();
        console.log(`✅ Added article ${itemId} to ${email}`);
        return true;
      } else {
        console.log(`ℹ️ Article ${itemId} already owned by ${email}`);
      }
    } else if (type === 'book') {
      // Check if already purchased
      const alreadyOwned = user.purchasedBooks?.some(
        purchase => purchase.bookId === itemId
      );
      
      if (!alreadyOwned) {
        user.purchasedBooks = user.purchasedBooks || [];
        user.purchasedBooks.push({
          bookId: itemId,
          purchaseDate: new Date(),
          paymentMethod: paymentMethod,
          transactionId: transactionId,
          amount: amount || 0
        });
        await user.save();
        console.log(`✅ Added book ${itemId} to ${email}`);
        return true;
      } else {
        console.log(`ℹ️ Book ${itemId} already owned by ${email}`);
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error adding to user library:', error);
    throw error;
  }
};

// Confirm payment and add item to user's library
const confirmPayment = async (req, res) => {
  try {
    console.log('🔍 CONFIRM PAYMENT REQUEST:', req.body);
    
    const { email, articleId, paymentMethod, sessionId, orderId, type = 'article' } = req.body;

    let paymentVerified = false;
    let transactionId = '';
    let amount = 0;

    // Verify Stripe payment if sessionId provided
    if (sessionId && paymentMethod === 'stripe') {
      console.log(`Verifying Stripe session: ${sessionId}`);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ 
          success: false,
          error: 'Payment not completed',
          details: `Payment status: ${session.payment_status}`
        });
      }
      
      paymentVerified = true;
      transactionId = session.id;
      amount = session.amount_total / 100;
      console.log(`✅ Stripe payment verified: ${sessionId}`);
    }

    // Verify PayPal payment if orderId provided
    if (orderId && paymentMethod === 'paypal') {
      console.log(`Verifying PayPal order: ${orderId}`);
      
      try {
        // First get order details
        const getRequest = new paypal.orders.OrdersGetRequest(orderId);
        const orderResponse = await paypalClient.execute(getRequest);
        console.log('PayPal order status:', orderResponse.result.status);
        
        // If APPROVED, capture it
        if (orderResponse.result.status === 'APPROVED') {
          const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
          const captureResponse = await paypalClient.execute(captureRequest);
          
          if (captureResponse.result.status === 'COMPLETED') {
            paymentVerified = true;
            transactionId = orderId;
            amount = parseFloat(captureResponse.result.purchase_units[0]?.amount?.value || 0);
            console.log(`✅ PayPal payment captured: ${orderId}`);
          }
        } else if (orderResponse.result.status === 'COMPLETED') {
          // Already completed
          paymentVerified = true;
          transactionId = orderId;
          amount = parseFloat(orderResponse.result.purchase_units[0]?.amount?.value || 0);
          console.log(`✅ PayPal payment already completed: ${orderId}`);
        }
      } catch (paypalError) {
        console.error('PayPal verification error:', paypalError);
        return res.status(400).json({
          success: false,
          error: 'PayPal payment verification failed',
          message: paypalError.message
        });
      }
    }

    if (!paymentVerified) {
      return res.status(400).json({ 
        success: false,
        error: 'Payment verification failed' 
      });
    }

    // Add to user's library
    const added = await addToUserLibrary(email, articleId, type, paymentMethod, transactionId, amount);

    res.json({ 
      success: true, 
      message: 'Payment confirmed and item added to your library',
      itemId: articleId,
      type: type,
      transactionId: transactionId
    });
  } catch (error) {
    console.error('❌ Payment confirmation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to confirm payment',
      message: error.message
    });
  }
};

// Simple payment verification (for frontend redirects)
const verifyPayment = async (req, res) => {
  try {
    console.log('🔎 VERIFY PAYMENT REQUEST:', req.body);
    
    const { sessionId, orderId, paymentMethod } = req.body;
    
    if (paymentMethod === 'stripe' && sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      res.json({
        success: session.payment_status === 'paid',
        status: session.payment_status,
        email: session.customer_email,
        amount: session.amount_total / 100,
        itemId: session.metadata?.itemId
      });
      
    } else if (paymentMethod === 'paypal' && orderId) {
      const getRequest = new paypal.orders.OrdersGetRequest(orderId);
      const orderResponse = await paypalClient.execute(getRequest);
      
      const isCompleted = orderResponse.result.status === 'COMPLETED';
      const isApproved = orderResponse.result.status === 'APPROVED';
      
      res.json({
        success: isCompleted || isApproved,
        status: orderResponse.result.status,
        email: orderResponse.result.payer?.email_address,
        amount: orderResponse.result.purchase_units[0]?.amount?.value,
        itemId: orderResponse.result.purchase_units[0]?.custom_id?.split('_')[1]
      });
      
    } else {
      res.status(400).json({
        success: false,
        error: 'Missing payment information'
      });
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment verification failed',
      message: error.message
    });
  }
};

// Test payment endpoint (for development)
const testPayment = async (req, res) => {
  try {
    const { email, articleId, type = 'article' } = req.body;

    console.log('🧪 TEST PAYMENT for:', email, 'item:', articleId);

    // Use the helper function
    const added = await addToUserLibrary(email, articleId, type, 'test', `test_${Date.now()}`, 0);

    res.json({ 
      success: true, 
      message: 'Test purchase successful! Item added to your library.',
      itemId: articleId
    });
  } catch (error) {
    console.error('❌ Test payment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Test payment failed',
      message: error.message
    });
  }
};

module.exports = { 
  stripePayment, 
  paypalPayment, 
  confirmPayment,
  verifyPayment,
  paypalWebhook,
  testPayment
};