import jwt from 'jsonwebtoken';
import { dbPromise } from '../db/db.js'; // Import dbPromise
const JWT_SECRET = process.env.JWT_SECRET || 'a-very-secret-key-that-should-be-in-env';

export const protect = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { db } = await dbPromise;

        // Fetch the full user from DB and attach to request
        req.user = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// New middleware to check for admin role
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

export const barista = (req, res, next) => {
    // Allow access if user is a barista OR an admin
    if (req.user && (req.user.role === 'barista' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized for this action' });
    }
};