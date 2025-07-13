import express from 'express';
// Add changeUserPassword to the import
import { updateUserProfile, changeUserPassword } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, changeUserPassword); // <-- ADD THIS LINE

export default router;