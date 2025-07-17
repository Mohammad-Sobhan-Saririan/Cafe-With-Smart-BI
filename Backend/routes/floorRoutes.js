import express from 'express';
import { getAllFloors, createFloor, deleteFloor } from '../controllers/floorController.js';
import { protect, can } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', getAllFloors); // Public, so users can see floors during checkout
router.post('/', protect, can('barista', 'admin'), createFloor);
router.delete('/:id', protect, can('barista', 'admin'), deleteFloor);
export default router;