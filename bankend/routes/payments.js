import express from 'express';
import { 
  createStripePayment, 
  createPayPalPayment 
} from '../controllers/paymentController.js';

const router = express.Router();

// Stripe payment
router.post('/stripe', createStripePayment);

// PayPal payment
router.post('/paypal', createPayPalPayment);

export default router;