import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getAllUsers, updateUser, getAllOrders, updateOrderStatus, bulkUpdateCredits, createUser } from '../controllers/adminController.js';
const router = express.Router();

// All routes in this file are protected and require admin access
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id', protect, admin, updateUser);

router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);

router.post('/credits/bulk-update', protect, admin, bulkUpdateCredits);

router.post('/users', protect, admin, createUser);


export default router;