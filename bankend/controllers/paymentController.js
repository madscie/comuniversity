const db = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Get book details
    const [books] = await db.execute(
      'SELECT id, title, price FROM books WHERE id = ? AND status = "available"',
      [bookId]
    );

    if (books.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    const book = books[0];

    // Check if user already owns the book
    const [existingPurchase] = await db.execute(
      'SELECT id FROM user_library WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );

    if (existingPurchase.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'You already own this book'
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(book.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: userId.toString(),
        bookId: bookId.toString(),
        bookTitle: book.title
      }
    });

    // Create payment record
    await db.execute(
      `INSERT INTO payments (user_id, book_id, amount, stripe_payment_intent_id, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, bookId, book.price, paymentIntent.id]
    );

    res.json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment not completed'
      });
    }

    // Update payment status
    await db.execute(
      `UPDATE payments SET status = 'completed', completed_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_intent_id = ? AND user_id = ?`,
      [paymentIntentId, userId]
    );

    // Add book to user library
    const [payments] = await db.execute(
      'SELECT book_id, amount FROM payments WHERE stripe_payment_intent_id = ?',
      [paymentIntentId]
    );

    if (payments.length > 0) {
      const payment = payments[0];
      
      await db.execute(
        `INSERT INTO user_library (user_id, book_id, purchase_price) 
         VALUES (?, ?, ?)`,
        [userId, payment.book_id, payment.amount]
      );
    }

    res.json({
      status: 'success',
      message: 'Payment verified successfully',
      data: {
        transactionId: paymentIntentId
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