import express from 'express';
import { getUserOrders, createOrder, getOrderById } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

// Both routes are protected. User must be logged in.
router.get('/', protect, getUserOrders);
router.post('/', createOrder);


router.get('/:id', getOrderById);

export default router;