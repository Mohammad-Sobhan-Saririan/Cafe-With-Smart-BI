import express from 'express';
import {
    getAllProducts,
    getManageableProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import { protect, barista } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Public Route ---
router.get('/', getAllProducts);

// --- Protected Barista/Admin Routes ---
router.get('/manage', protect, barista, getManageableProducts);
router.post('/', protect, barista, createProduct);
router.put('/:id', protect, barista, updateProduct);
router.delete('/:id', protect, barista, deleteProduct);

export default router;