import jwt from 'jsonwebtoken';
import { dbPromise } from '../db/db.js'; // Corrected path
const JWT_SECRET = process.env.JWT_SECRET || 'a-very-secret-key-that-should-be-in-env';

// This middleware remains the same. It verifies the user is logged in.
export const protect = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { db } = await dbPromise;
        // We fetch the role from the database here
        req.user = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// --- THIS IS YOUR NEW, FLEXIBLE ROLE CHECKER ---
// It's a function that returns a middleware. It can check for one or more roles.
export const can = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (userRole && allowedRoles.includes(userRole)) {
            next(); // User has one of the allowed roles, proceed
        } else {
            res.status(403).json({ message: 'Forbidden: You do not have the required role for this action.' });
        }
    };
};