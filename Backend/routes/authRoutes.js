import express from 'express';
// Add getProfile and logout to the import
import { register, login, getProfile, logout } from '../controllers/authController.js'; // Import the auth controller functions

const router = express.Router();

// router.post('/register', register);
router.post('/login', login);
router.get('/profile', getProfile); // Add this route
router.post('/logout', logout);    // Add this route

export default router;