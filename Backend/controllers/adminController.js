import { dbPromise } from '../db/db.js'; // Import dbPromise
import { sendEventToUser } from '../services/sseService.js';
import bcrypt from 'bcryptjs';
export const getAllUsers = async (req, res) => {
    const { search = '' } = req.query; // Get search term from query params
    try {
        const { db } = await dbPromise;

        let sql = 'SELECT id, name, email, role, position, creditBalance, creditLimit ,employeeNumber FROM users';
        const params = [];

        if (search) {
            sql += ' WHERE name LIKE ? OR employeeNumber LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        const users = await db.all(sql, params);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, position, creditLimit, creditBalance, employeeNumber } = req.body;
    try {
        const { db } = await dbPromise;

        // Check if the employeeNumber already exists for another user
        const existingUser = await db.get(
            'SELECT id FROM users WHERE employeeNumber = ? AND id != ?',
            [employeeNumber, id]
        );

        if (existingUser) {
            return res.status(400).json({ message: 'Employee number already exists for another user.' });
        }

        // Proceed with the update if no conflict is found
        await db.run(
            `UPDATE users SET 
                name = ?, email = ?, role = ?, position = ?, creditLimit = ?, creditBalance = ?, employeeNumber = ?
             WHERE id = ?`,
            [name, email, role, position, creditLimit, creditBalance, employeeNumber, id]
        );

        res.status(200).json({ message: 'User updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    const {
        search = '', status = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc'
    } = req.query;

    // --- NEW: Whitelist and mapping for sorting ---
    const columnMap = {
        id: 'o.id',
        userName: 'u.name',
        createdAt: 'o.createdAt',
        totalAmount: 'o.totalAmount',
        status: 'o.status'
    };
    const allowedSortBy = Object.keys(columnMap);

    // Check if the requested sortBy key is in our map, otherwise default to createdAt
    const safeSortBy = allowedSortBy.includes(sortBy) ? columnMap[sortBy] : 'o.createdAt';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    // ---

    try {
        const { db } = await dbPromise;
        const offset = (page - 1) * limit;

        // The params and whereClauses logic remains the same
        const params = [];
        const whereClauses = [];
        let countSql = 'SELECT COUNT(o.id) as count FROM orders o LEFT JOIN users u ON o.userId = u.id';

        if (search) {
            whereClauses.push(`(u.name LIKE ? OR o.id LIKE ?)`);
            params.push(`%${search}%`, `%${search}%`);
        }
        if (status && status !== 'All') {
            whereClauses.push(`o.status = ?`);
            params.push(status);
        }
        if (whereClauses.length > 0) {
            countSql += ' WHERE ' + whereClauses.join(' AND ');
        }

        const totalResult = await db.get(countSql, params);
        const totalOrders = totalResult.count;
        const totalPages = Math.ceil(totalOrders / limit);

        // The data fetching query also remains the same...
        let dataSql = `
        SELECT o.id, u.name as userName, o.createdAt, o.totalAmount, o.status
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
      `;
        if (whereClauses.length > 0) {
            dataSql += ' WHERE ' + whereClauses.join(' AND ');
        }
        // ...but now this ORDER BY clause uses the real, mapped column name
        dataSql += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`;
        // We create a new params array for this query because the original one was used for counting
        const dataParams = [...params, limit, offset];

        const orders = await db.all(dataSql, dataParams);

        res.json({
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalOrders
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: 'A valid status is required.' });
    }

    const { db } = await dbPromise;

    try {
        // --- BEGIN TRANSACTION ---
        await db.exec('BEGIN TRANSACTION');

        // First, get the order details, especially the items and current status
        const order = await db.get('SELECT userId, items, status as currentStatus FROM orders WHERE id = ?', [id]);

        if (!order) {
            await db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Order not found' });
        }

        // --- RESTOCK LOGIC ---
        // If an order is being moved FROM 'Pending' TO 'Cancelled', restock the items.
        if (order.currentStatus === 'Pending' && status === 'Cancelled') {
            const items = JSON.parse(order.items);
            for (const item of items) {
                await db.run(
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.id]
                );
            }
            console.log(`Restocked items for cancelled order ${id}`);
        }

        // Finally, update the order's status
        await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

        // If everything succeeded, commit the transaction
        await db.exec('COMMIT');

        // Send real-time notification to the user
        if (order.userId) {
            sendEventToUser(order.userId, { type: 'ORDER_UPDATE', orderId: id, status: status });
        }

        res.status(200).json({ message: 'Order status updated successfully.' });

    } catch (error) {
        // If any error occurred, cancel everything
        await db.exec('ROLLBACK');
        res.status(500).json({ message: 'Server error during transaction', error: error.message });
    }
};

export const bulkUpdateCredits = async (req, res) => {
    const { amount, operation, filter } = req.body;

    // Validate input
    if (!amount || !operation || !['set', 'add'].includes(operation)) {
        return res.status(400).json({ message: 'Invalid amount or operation specified.' });
    }

    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount)) {
        return res.status(400).json({ message: 'Amount must be a valid number.' });
    }

    try {
        const { db } = await dbPromise;
        let sql;
        const params = [numericAmount];

        // Build the base of the SQL query based on the operation
        if (operation === 'set') {
            sql = 'UPDATE users SET creditBalance = ?';
        } else { // operation === 'add'
            sql = 'UPDATE users SET creditBalance = creditBalance + ?';
        }

        // Add a WHERE clause if a filter is provided
        if (filter && filter.position) {
            sql += ' WHERE position = ?';
            params.push(filter.position);
        }

        // Execute the dynamic query
        const result = await db.run(sql, params);

        res.status(200).json({ message: `Successfully updated ${result.changes} users.` });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const createUser = async (req, res) => {
    // Admin can set all these fields
    const { name, email, password, employeeNumber, role, position, creditLimit } = req.body;

    if (!name || !email || !password || !employeeNumber || !role) {
        return res.status(401).json({ message: 'Please provide all required fields.' });
    }

    try {
        const { db, nanoid } = await dbPromise;

        const existingUser = await db.get('SELECT * FROM users WHERE email = ? OR employeeNumber = ?', [email, employeeNumber]);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or employee number already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            id: nanoid(),
            name, email, password: hashedPassword, employeeNumber, role, position,
            creditLimit: creditLimit || 1000000,
            creditBalance: creditLimit || 1000000,
        };

        await db.run(
            'INSERT INTO users (id, name, email, password, employeeNumber, role, position, creditLimit, creditBalance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newUser.id, newUser.name, newUser.email, newUser.password, newUser.employeeNumber, newUser.role, newUser.position, newUser.creditLimit, newUser.creditBalance]
        );

        res.status(201).json({ message: 'User created successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};