import { dbPromise } from '../db/db.js';
import { nanoid } from 'nanoid'; // Ensure you have nanoid installed
import { sendEventToUser, broadcastEvent } from '../services/sseService.js';

// Get orders for the logged-in user
export const getUserOrders = async (req, res) => {
    try {
        const { db } = await dbPromise;
        const orders = await db.all('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [req.user.id]);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'خطای سرور', error: error.message });
    }
};

// Create a new order
export const createOrder = async (req, res) => {
    const { items, totalAmount, employeeNumber, deliveryFloorId } = req.body; // Get deliveryFloorId
    if (!deliveryFloorId) {
        return res.status(400).json({ message: 'لطفا طبقه تحویل را انتخاب کنید.' });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'امکان ثبت سفارش خالی وجود ندارد.' });
    }

    const { db } = await dbPromise;

    try {
        await db.exec('BEGIN TRANSACTION');

        let user = null;
        let userId = null;

        if (employeeNumber) {
            user = await db.get('SELECT * FROM users WHERE employeeNumber = ?', [employeeNumber]);
            if (user) { userId = user.id; }
        }

        const creditSystemConfig = await db.get("SELECT isEnabled FROM configs WHERE feature = 'creditSystem'");
        const isCreditSystemEnabled = creditSystemConfig && creditSystemConfig.isEnabled;

        if (isCreditSystemEnabled && user) {
            if (user.creditBalance < totalAmount) {
                await db.exec('ROLLBACK');
                return res.status(400).json({ message: 'موجودی اعتبار کافی نیست.' });
            }
            const newBalance = user.creditBalance - totalAmount;
            await db.run('UPDATE users SET creditBalance = ? WHERE id = ?', [newBalance, userId]);
        }

        for (const item of items) {
            const product = await db.get('SELECT name, stock FROM products WHERE id = ?', [item.id]);
            if (!product || product.stock < item.quantity) {
                await db.exec('ROLLBACK');
                return res.status(400).json({ message: `متاسفیم، موجودی '${product.name}' کافی نیست.` });
            }
        }

        // --- NEW ORDER ID LOGIC STARTS HERE ---

        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        const result = await db.get("SELECT COUNT(*) as count FROM orders WHERE date(createdAt) = ?", [todayString]);
        const today_s_orders_count = result.count;

        const dateForId = today.getFullYear().toString() +
            (today.getMonth() + 1).toString().padStart(2, '0') +
            today.getDate().toString().padStart(2, '0');

        const newOrderId = `${dateForId}-${today_s_orders_count + 1}`;

        // --- NEW ORDER ID LOGIC ENDS HERE ---

        for (const item of items) {
            await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
        }

        // const LocalTime = new Date().toTimeString().split(' ')[0];
        const LocalTime = new Date().toLocaleTimeString('en-IR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Tehran',
            hour12: false
        });

        const TodayTime = `${todayString} ${LocalTime}`;

        const newOrder = {
            id: newOrderId,
            userId,
            items: JSON.stringify(items),
            totalAmount,
            status: 'Pending',
            createdAt: TodayTime,
        };
        console.log(`deliveryFloorId: ${deliveryFloorId}`);
        await db.run(
            'INSERT INTO orders (id, userId, items, totalAmount, createdAt, status, deliveryFloorId) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [newOrder.id, newOrder.userId, newOrder.items, newOrder.totalAmount, newOrder.createdAt, newOrder.status, deliveryFloorId]
        );

        await db.exec('COMMIT');
        res.status(201).json({ message: 'سفارش با موفقیت ثبت شد!', order: newOrder });

    } catch (error) {
        await db.exec('ROLLBACK');
        res.status(500).json({ message: 'خطای سرور در هنگام تراکنش', error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const { db } = await dbPromise;
        const order = await db.get(`
        SELECT o.*, u.name as userName 
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        WHERE o.id = ?
      `, [id]);

        if (!order) {
            return res.status(404).json({ message: "سفارش یافت نشد." });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'خطای سرور', error: error.message });
    }
};
