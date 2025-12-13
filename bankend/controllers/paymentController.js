// backend/controllers/paymentController.js
import stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Initialize PayPal
let paypalClient;
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
  let paypalEnvironment;
  if (process.env.NODE_ENV === 'production' && process.env.PAYPAL_MODE === 'live') {
    paypalEnvironment = new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
  } else {
    paypalEnvironment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
  }
  paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);
}

// Helper function to add items to user library (MongoDB version)
const addToUserLibrary = async (db, email, itemId, type, paymentMethod, transactionId, amount) => {
  try {
    const usersCollection = db.collection('users');
    
    // Find or create user
    let user = await usersCollection.findOne({ email });
    
    if (!user) {
      user = {
        email: email,
        name: email.split('@')[0],
        password: 'guest_' + Math.random().toString(36).substr(2, 9),
        purchasedArticles: [],
        purchasedBooks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(user);
      user._id = result.insertedId;
      console.log(`👤 Created new user for: ${email}`);
    }

    // Add item based on type
    if (type === 'article') {
      // Check if already purchased
      const alreadyOwned = user.purchasedArticles?.some(
        purchase => purchase.articleId === itemId
      );
      
      if (!alreadyOwned) {
        const purchaseRecord = {
          articleId: itemId,
          purchaseDate: new Date(),
          paymentMethod: paymentMethod,
          transactionId: transactionId,
          amount: amount || 0
        };
        
        await usersCollection.updateOne(
          { email: email },
          { 
            $push: { purchasedArticles: purchaseRecord },
            $set: { updatedAt: new Date() }
          }
        );
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
        const purchaseRecord = {
          bookId: itemId,
          purchaseDate: new Date(),
          paymentMethod: paymentMethod,
          transactionId: transactionId,
          amount: amount || 0
        };
        
        await usersCollection.updateOne(
          { email: email },
          { 
            $push: { purchasedBooks: purchaseRecord },
            $set: { updatedAt: new Date() }
          }
        );
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

// Stripe payment - Creates checkout session for redirect
export const createStripePayment = async (req, res) => {
  try {
    console.log('💳 STRIPE PAYMENT REQUEST:', req.body);
    
    // FIXED: Accept both snake_case and camelCase for compatibility
    const { 
      amount, 
      articleId, 
      email, 
      success_url, 
      successUrl, 
      cancel_url, 
      cancelUrl, 
      type = 'article' 
    } = req.body;

    // Use the provided URL or fallback to a default
    const successUrlToUse = success_url || successUrl;
    const cancelUrlToUse = cancel_url || cancelUrl;

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
    let itemId = articleId || 'general';
    
    if (type === 'article') {
      productName = `Article: ${articleId || 'Premium Content'}`;
    } else if (type === 'book') {
      productName = `Book: ${articleId || 'Digital Book'}`;
    }

    console.log(`Creating Stripe checkout for ${email}, amount: $${amount}`);
    console.log('Success URL to use:', successUrlToUse);
    console.log('Cancel URL to use:', cancelUrlToUse);

    // FIXED: Use the provided success URL exactly as sent from frontend
    // Frontend sends: http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}&article_id=...&email=...
    // We just pass this directly to Stripe - it will replace {CHECKOUT_SESSION_ID}
    let finalSuccessUrl;
    if (successUrlToUse) {
      // Use the exact URL provided by frontend
      finalSuccessUrl = successUrlToUse;
    } else {
      // Fallback if no URL provided
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
      finalSuccessUrl = `${frontendBase}/payment-success?session_id={CHECKOUT_SESSION_ID}&item_id=${itemId}&email=${encodeURIComponent(email)}&type=${type}&payment_method=stripe`;
    }

    // FIXED: Use the provided cancel URL or create a fallback
    let finalCancelUrl;
    if (cancelUrlToUse) {
      finalCancelUrl = cancelUrlToUse;
    } else {
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
      finalCancelUrl = `${frontendBase}/payment-cancelled?item_id=${itemId}&type=${type}`;
    }

    console.log('Final Success URL:', finalSuccessUrl);
    console.log('Final Cancel URL:', finalCancelUrl);

    const session = await stripeClient.checkout.sessions.create({
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
      // FIXED: Use the URLs exactly as provided/constructed
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      customer_email: email,
      metadata: {
        itemId: itemId,
        email: email,
        type: type
      },
      // Optional: Add these for better user experience
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'ZM'], // Adjust for your needs
      },
    });

    console.log('✅ Stripe session created:', session.id);
    console.log('🔗 Session URL:', session.url);
    console.log('✅ Success URL in session:', session.success_url);
    console.log('❌ Cancel URL in session:', session.cancel_url);

    // Save to database for tracking
    const db = req.app.locals.db;
    if (db) {
      await db.collection('stripe_sessions').insertOne({
        sessionId: session.id,
        articleId: itemId,
        email: email,
        amount: amount,
        status: 'pending',
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
        createdAt: new Date(),
        type: type
      });
    }

    res.json({ 
      success: true,
      url: session.url,
      sessionId: session.id,
      success_url: session.success_url,
      cancel_url: session.cancel_url
    });

  } catch (error) {
    console.error('❌ STRIPE ERROR:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment processing failed',
      message: error.message,
      details: error.type || 'Unknown error'
    });
  }
};

// PayPal payment
export const createPayPalPayment = async (req, res) => {
  try {
    console.log('💳 PAYPAL PAYMENT REQUEST:', req.body);
    
    const { amount, articleId, email, success_url, successUrl, cancel_url, cancelUrl, type = 'article' } = req.body;

    // Use the provided URL or fallback to a default
    const successUrlToUse = success_url || successUrl;
    const cancelUrlToUse = cancel_url || cancelUrl;

    // Check if PayPal client is available
    if (!paypalClient) {
      return res.status(500).json({ 
        success: false,
        error: 'PayPal service unavailable',
        message: 'PayPal client not configured. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env'
      });
    }

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
    let itemId = articleId || 'general';
    
    if (type === 'article') {
      productName = `Article: ${articleId || 'Premium Content'}`;
    } else if (type === 'book') {
      productName = `Book: ${articleId || 'Digital Book'}`;
    }

    console.log(`Creating PayPal order for ${email}, amount: $${amount}`);

    // Create PayPal order using the SDK
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    
    // FIXED: Use the provided success URL
    let returnUrl;
    if (successUrlToUse) {
      // Replace {ORDER_ID} placeholder with the actual order ID
      returnUrl = successUrlToUse.replace('{ORDER_ID}', '{ORDER_ID}');
    } else {
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
      returnUrl = `${frontendBase}/payment-success?item_id=${itemId}&email=${encodeURIComponent(email)}&type=${type}&payment_method=paypal&order_id={ORDER_ID}`;
    }
    
    // FIXED: Use the provided cancel URL
    let finalCancelUrl;
    if (cancelUrlToUse) {
      finalCancelUrl = cancelUrlToUse;
    } else {
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
      finalCancelUrl = `${frontendBase}/payment-cancelled?item_id=${itemId}&type=${type}`;
    }
    
    console.log('PayPal return URL:', returnUrl);
    console.log('PayPal cancel URL:', finalCancelUrl);

    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { 
          currency_code: 'USD', 
          value: amount.toString()
        },
        description: productName,
        custom_id: `${type}_${itemId}`, // Store article ID here
        invoice_id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }],
      application_context: {
        return_url: returnUrl,
        cancel_url: finalCancelUrl,
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        brand_name: 'Communiversity',
        landing_page: 'BILLING'
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

    // Save to database
    const db = req.app.locals.db;
    if (db) {
      await db.collection('paypal_orders').insertOne({
        orderId: response.result.id,
        articleId: itemId,
        email: email,
        amount: amount,
        status: 'pending',
        return_url: returnUrl,
        cancel_url: finalCancelUrl,
        createdAt: new Date(),
        type: type
      });
    }

    res.json({ 
      success: true,
      url: approvalLink.href,
      orderId: response.result.id,
      return_url: returnUrl
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
export const paypalWebhook = async (req, res) => {
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
      let itemId = null;
      let itemType = 'article';
      
      if (customId) {
        const parts = customId.split('_');
        if (parts.length >= 2) {
          itemType = parts[0];
          itemId = parts[1];
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
      if (payerEmail && itemId && itemId !== 'general') {
        const db = req.app.locals.db;
        if (db) {
          await addToUserLibrary(db, payerEmail, itemId, itemType, 'paypal', orderId, amount);
        } else {
          console.error('❌ Database not available in webhook handler');
        }
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ PayPal webhook error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Confirm payment and add item to user's library
export const confirmPayment = async (req, res) => {
  try {
    console.log('🔍 CONFIRM PAYMENT REQUEST:', req.body);
    
    const { email, articleId, paymentMethod, sessionId, orderId, type = 'article' } = req.body;

    let paymentVerified = false;
    let transactionId = '';
    let amount = 0;

    // Verify Stripe payment if sessionId provided
    if (sessionId && paymentMethod === 'stripe') {
      console.log(`Verifying Stripe session: ${sessionId}`);
      const session = await stripeClient.checkout.sessions.retrieve(sessionId);
      
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
        const getRequest = new paypal.orders.OrdersGetRequest(orderId);
        const orderResponse = await paypalClient.execute(getRequest);
        console.log('PayPal order status:', orderResponse.result.status);
        
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
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available'
      });
    }

    const added = await addToUserLibrary(db, email, articleId, type, paymentMethod, transactionId, amount);

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
export const verifyPayment = async (req, res) => {
  try {
    console.log('🔎 VERIFY PAYMENT REQUEST:', req.body);
    
    const { sessionId, orderId, paymentMethod } = req.body;
    
    if (paymentMethod === 'stripe' && sessionId) {
      const session = await stripeClient.checkout.sessions.retrieve(sessionId);
      
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
export const testPayment = async (req, res) => {
  try {
    const { email, articleId, type = 'article' } = req.body;

    console.log('🧪 TEST PAYMENT for:', email, 'item:', articleId);

    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available'
      });
    }

    const added = await addToUserLibrary(db, email, articleId, type, 'test', `test_${Date.now()}`, 0);

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