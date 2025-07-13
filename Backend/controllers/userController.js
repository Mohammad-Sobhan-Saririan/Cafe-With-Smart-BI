import { dbPromise } from '../db/db.js';
import bcrypt from 'bcryptjs'; // Make sure bcryptjs is imported

export const updateUserProfile = async (req, res) => {
    const userId = req.user.id;

    // 1. Destructure all the fields we want the user to be able to change
    const { name, phone, country, city, age, position } = req.body;

    try {
        const { db } = await dbPromise;

        // 2. Update the SQL query to include all the new fields
        await db.run(
            `UPDATE users SET name = ?, phone = ?, country = ?, city = ?, age = ?, position = ?
         WHERE id = ?`,
            [name, phone, country, city, age, position, userId]
        );

        // 3. Fetch the complete, updated profile to send back
        const updatedUser = await db.get(
            'SELECT id, name, email, role, phone, country, city, age, position, creditBalance FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const changeUserPassword = async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both old and new passwords.' });
    }

    try {
        const { db } = await dbPromise;

        // 1. Fetch the user's current hashed password from the DB
        const user = await db.get('SELECT password FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // 2. Compare the provided old password with the stored hash
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        // 3. If it matches, hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update the database with the new hashed password
        await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

        res.status(200).json({ message: 'Password changed successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};