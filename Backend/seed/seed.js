import fs from 'fs';
import path from 'path';
import https from 'https';
import { createClient } from 'pexels';
import { dbPromise } from '../db/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '6iGboHUEGY2tL6gXB4jNSSDg0NRnZvIN9XJfuLGQoCkRWfakuL9AERz4';
const USE_EXISTING_IMAGES = true; // ← Change to false to force re-download

const client = createClient(PEXELS_API_KEY);
const IMAGE_FOLDER = path.resolve('../images');

const productsToInsert = [
    { id: "1", name: "اسپرسو", enName: "Espresso", price: 30000, category: "بار گرم", imageUrl: "", rating: 4.5, maxOrderPerUser: 5, description: "یک فنجان اسپرسو غلیظ و خوشمزه با طعم قوی قهوه.", stock: 100, isDisabled: false },
    { id: "2", name: "کافه لاته", enName: "Cafe Latte", price: 45000, category: "بار گرم", imageUrl: "", rating: 4.8, maxOrderPerUser: 3, description: "یک فنجان کافه لاته با شیر بخار داده شده و کف شیر.", stock: 100, isDisabled: false },
    { id: "3", name: "آیس کارامل ماکیاتو", enName: "Iced Caramel Macchiato", price: 65000, category: "بار سرد", imageUrl: "", rating: 4.9, maxOrderPerUser: 2, description: "یک نوشیدنی خنک و شیرین با طعم کارامل.", stock: 100, isDisabled: false },
    { id: "4", name: "موهیتو", enName: "Mojito", price: 55000, category: "بار سرد", imageUrl: "", rating: 4.6, maxOrderPerUser: 4, description: "یک نوشیدنی خنک و تازه با نعناع و لیمو.", stock: 100, isDisabled: false },
    { id: "5", name: "چای ماسالا", enName: "Chai Masala", price: 25000, category: "بار گرم", imageUrl: "", rating: 4.3, maxOrderPerUser: 6, description: "یک فنجان چای ماسالا با ادویه‌های معطر و شیر.", stock: 100, isDisabled: false },
    { id: "6", name: "اسموتی توت فرنگی", enName: "Strawberry Smoothie", price: 70000, category: "بار سرد", imageUrl: "", rating: 4.7, maxOrderPerUser: 3, description: "یک اسموتی خوشمزه و خنک با طعم توت فرنگی.", stock: 100, isDisabled: false },
    { id: "7", name: "کاپوچینو", enName: "Cappuccino", price: 40000, category: "بار گرم", imageUrl: "", rating: 4.4, maxOrderPerUser: 5, description: "یک فنجان کاپوچینو با شیر بخار داده شده و کف شیر.", stock: 100, isDisabled: false },
    { id: "8", name: "آیس تی لیمویی", enName: "Iced Lemon Tea", price: 30000, category: "بار سرد", imageUrl: "", rating: 4.2, maxOrderPerUser: 4, description: "یک نوشیدنی خنک و تازه با طعم لیمو.", stock: 100, isDisabled: false },
    { id: "9", name: "شیک شکلاتی", enName: "Chocolate Shake", price: 60000, category: "بار سرد", imageUrl: "", rating: 4.8, maxOrderPerUser: 2, description: "یک شیک خوشمزه و خامه‌ای با طعم شکلات.", stock: 100, isDisabled: false },
    { id: "10", name: "چای سبز یخ زده", enName: "Iced Green Tea", price: 35000, category: "بار سرد", imageUrl: "", rating: 4.1, maxOrderPerUser: 5, description: "یک نوشیدنی خنک و سالم با طعم چای سبز.", stock: 100, isDisabled: false },
    { id: "11", name: "هات چاکلت", enName: "Hot Chocolate", price: 40000, category: "بار گرم", imageUrl: "", rating: 4.5, maxOrderPerUser: 3, description: "یک فنجان هات چاکلت داغ و خوشمزه با خامه.", stock: 100, isDisabled: false },
    { id: "12", name: "آبمیوه طبیعی", enName: "Fresh Juice", price: 50000, category: "بار سرد", imageUrl: "", rating: 4.6, maxOrderPerUser: 4, description: "یک لیوان آبمیوه طبیعی و تازه.", stock: 100, isDisabled: false },
    { id: "13", name: "دمنوش گیاهی", enName: "Herbal Tea", price: 20000, category: "بار گرم", imageUrl: "", rating: 4.0, maxOrderPerUser: 6, description: "یک فنجان دمنوش گیاهی آرامش‌بخش.", stock: 100, isDisabled: false },
    { id: "14", name: "آیس کافی", enName: "Iced Coffee", price: 45000, category: "بار سرد", imageUrl: "", rating: 4.3, maxOrderPerUser: 5, description: "یک نوشیدنی خنک و قوی با طعم قهوه.", stock: 100, isDisabled: false },
    { id: "15", name: "اسموتی موز و انبه", enName: "Banana Mango Smoothie", price: 65000, category: "بار سرد", imageUrl: "", rating: 4.9, maxOrderPerUser: 2, description: "یک اسموتی خوشمزه و خنک با طعم موز و انبه.", stock: 100, isDisabled: false },
    { id: "16", name: "چای سیاه", enName: "Black Tea", price: 25000, category: "بار گرم", imageUrl: "", rating: 4.2, maxOrderPerUser: 6, description: "یک فنجان چای سیاه داغ و خوشمزه.", stock: 100, isDisabled: false },
    { id: "17", name: "آیس موکا", enName: "Iced Mocha", price: 55000, category: "بار سرد", imageUrl: "", rating: 4.7, maxOrderPerUser: 3, description: "یک نوشیدنی خنک و شکلاتی با طعم قهوه.", stock: 100, isDisabled: false },
    { id: "18", name: "شیک وانیلی", enName: "Vanilla Shake", price: 60000, category: "بار سرد", imageUrl: "", rating: 4.8, maxOrderPerUser: 2, description: "یک شیک خوشمزه و خامه‌ای با طعم وانیل.", stock: 100, isDisabled: false },
    { id: "19", name: "چای نعناع", enName: "Mint Tea", price: 30000, category: "بار گرم", imageUrl: "", rating: 4.1, maxOrderPerUser: 5, description: "یک فنجان چای نعناع تازه و خوشبو.", stock: 100, isDisabled: false },
    { id: "20", name: "آیس چای هلو", enName: "Iced Peach Tea", price: 35000, category: "بار سرد", imageUrl: "", rating: 4.4, maxOrderPerUser: 4, description: "یک نوشیدنی خنک و میوه‌ای با طعم هلو.", stock: 100, isDisabled: false }
];

// Ensure image folder exists
if (!fs.existsSync(IMAGE_FOLDER)) {
    fs.mkdirSync(IMAGE_FOLDER, { recursive: true });
}

async function fetchImageUrl(query) {
    try {
        const response = await client.photos.search({ query, per_page: 1 });
        const photo = response.photos?.[0];
        return photo?.src?.medium || null;
    } catch (error) {
        console.error(`❌ Error fetching image for "${query}":`, error.message);
        return null;
    }
}

async function downloadImage(url, filename) {
    const filePath = path.join(IMAGE_FOLDER, filename);
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(`/images/${filename}`));
            });
        }).on('error', err => {
            fs.unlink(filePath, () => reject(err));
        });
    });
}

async function seed() {
    console.log('🌱 Seeding database...');
    try {
        const { db } = await dbPromise;

        const stmt = await db.prepare(`
            INSERT OR IGNORE INTO products (id, name, price, category, imageUrl, rating, maxOrderPerUser, description, stock, isDisabled)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let changes = 0;
        for (const product of productsToInsert) {
            const filename = `${product.enName.replace(/\s+/g, ' ')}.jpg`;
            const filePath = path.join(IMAGE_FOLDER, filename);

            if (USE_EXISTING_IMAGES && fs.existsSync(filePath)) {
                product.imageUrl = `http://localhost:5001/images/${filename}`; // Adjust this path if needed
                console.log(`📂 Using existing image for "${product.name}"`);
            } else {
                const imageUrl = await fetchImageUrl(product.enName);
                if (imageUrl) {
                    const localImagePath = await downloadImage(imageUrl, filename);
                    product.imageUrl = localImagePath;
                    console.log(`⬇️ Downloaded image for "${product.name}" (${product.enName})`);
                } else {
                    console.warn(`⚠️ No image found for "${product.name}" (${product.enName})`);
                }
            }

            const result = await stmt.run(
                product.id,
                product.name,
                product.price,
                product.category,
                product.imageUrl,
                product.rating,
                product.maxOrderPerUser,
                product.description,
                product.stock,
                product.isDisabled
            );
            changes += result.changes;
        }

        await stmt.finalize();

        if (changes > 0) {
            console.log(`✅ Successfully seeded ${changes} new products.`);
        } else {
            console.log('ℹ️ No new products were added (already exists).');
        }

        console.log('🎉 Seeding complete!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
    }
}

seed();
