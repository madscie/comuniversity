// backend/routes/payments.js
import express from 'express';
import { 
  createStripePayment, 
  createPayPalPayment,
  confirmPayment,
  verifyPayment,
  paypalWebhook,
  testPayment 
} from '../controllers/paymentController.js';

const router = express.Router();

// Payment routes
router.post('/stripe', createStripePayment);
router.post('/paypal', createPayPalPayment);
router.post('/confirm', confirmPayment);
router.post('/verify', verifyPayment);
router.post('/webhook/paypal', paypalWebhook);
router.post('/test', testPayment);

export default router;