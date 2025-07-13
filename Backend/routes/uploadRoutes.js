import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure where and how to store the files
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'images/'); // Save files to the 'public/images' folder
    },
    filename(req, file, cb) {
        // Create a unique filename to prevent overwriting
        // It will look like: product-1750626500123.jpg
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, `product-${uniqueSuffix}`);
    }
});

const upload = multer({ storage });

// Define the upload endpoint. The 'upload.single('image')' middleware processes the file.
router.post('/', upload.single('image'), (req, res) => {
    // If upload is successful, multer adds a 'file' object to the request.
    // We send back the public path to the newly uploaded file.
    if (req.file) {
        res.status(201).json({
            message: 'Image uploaded successfully',
            imageUrl: `/images/${req.file.filename}` // e.g., /images/product-1750626500123.jpg
        });
    } else {
        res.status(400).json({ message: 'No file uploaded.' });
    }
});

export default router;