import { dbPromise } from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'a-very-secret-key-that-should-be-in-env';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const { db, nanoid } = await dbPromise;

        // Check if user already exists
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = {
            id: nanoid(),
            name,
            email,
            password: hashedPassword
        };

        await db.run(
            'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
            [newUser.id, newUser.name, newUser.email, newUser.password]
        );

        res.status(201).json({ message: 'User registered successfully!', userId: newUser.id });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const login = async (req, res) => {
    // 1. Get 'rememberMe' from the request body
    const { employeeNumber, password, rememberMe } = req.body;

    if (!employeeNumber || !password) {
        return res.status(400).json({ message: 'لطفا شماره کارمندی و رمز عبور را وارد کنید' });
    }

    try {
        const { db } = await dbPromise;
        const user = await db.get('SELECT * FROM users WHERE employeeNumber = ?', [employeeNumber]);
        if (!user) {
            return res.status(400).json({ message: 'کاربری با این شماره کارمندی وجود ندارد' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'رمز عبور اشتباه است' });
        }
        // 2. Determine the token's lifespan
        const oneDay = 24 * 60 * 60 * 1000; // in milliseconds
        const thirtyDays = 30 * oneDay;
        const maxAge = rememberMe ? thirtyDays : oneDay;
        const expiresIn = rememberMe ? '30d' : '1d';

        const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, {
            expiresIn: expiresIn,
        });

        // 3. Use the new maxAge when setting the cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: maxAge
        });

        res.status(200).json({
            message: 'ورود با موفقیت انجام شد',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                country: user.country,
                city: user.city,
                age: user.age,
                position: user.position,
                creditBalance: user.creditBalance,
                role: user.role // Include role in the response
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'خطای سرور', error: error.message });
    }
};

// --- ADD THIS NEW FUNCTION ---
export const getProfile = async (req, res) => {
    // We need cookie-parser to read cookies. Let's add it in server.js
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'لطفا ابتدا وارد حساب کاربری خود شوید' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { db } = await dbPromise;
        const user = await db.get('SELECT id, name, email, phone, country, city, age, position, creditBalance, employeeNumber, role FROM users WHERE id = ?', [decoded.id]);

        if (!user) {
            return res.status(404).json({ message: 'کاربر یافت نشد' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: 'توکن نامعتبر است' });
    }
};

// --- ADD THIS NEW FUNCTION ---
export const logout = (req, res) => {
    // Clear the cookie
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Set expiry date to the past
    });
    res.status(200).json({ message: 'خروج از حساب کاربری با موفقیت انجام شد' });
};