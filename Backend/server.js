import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import { dbPromise } from './db/db.js'; // Import dbPromise
import authRoutes from './routes/authRoutes.js'; // Import auth routes
import cookieParser from 'cookie-parser';
import orderRoutes from './routes/orderRoutes.js'; // Import it
import adminRoutes from './routes/adminRoutes.js';
import eventsRoutes from './routes/eventsRoutes.js'; // Import events routes
import userRoutes from './routes/userRoutes.js'; // 1. Import the new routes
import baristaRoutes from './routes/baristaRoutes.js'; // 1. Import the new barista routes
import uploadRoutes from './routes/uploadRoutes.js'; // 1. Import the new routes
import reportingRoutes from './routes/reportingRoutes.js'; // Import reporting routes




// Load env vars
dotenv.config();

const app = express();

// Middlewares
// And REPLACE it with this:
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests ONLY from your frontend origin
    credentials: true                 // Allow cookies and authorization headers
}));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser()); // <-- ADD THIS LINE


// API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes); // Use auth routes
app.use('/api/orders', orderRoutes); // Add this line
app.use('/api/admin', adminRoutes); // Add this line
app.use('/api/events', eventsRoutes); // Add this line
app.use('/api/users', userRoutes); // 2. Add the new user routes
app.use('/api/barista', baristaRoutes); // 2. Add the new barista routes
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportingRoutes); // Add this line



// Serve static files from the images directory
app.use('/images', express.static('images'));

const PORT = process.env.PORT || 5001;

// Make sure the database is initialized before starting the server
dbPromise.then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}, using SQLite database.`));
}).catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
});