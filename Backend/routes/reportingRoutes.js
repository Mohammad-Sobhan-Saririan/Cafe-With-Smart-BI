import express from 'express';
// Add the new controller functions
import { runReportQuery, saveReport, getChartConfigForData, refineChart, deleteReport, getSavedReports } from '../controllers/reportingController.js';
import { protect, can } from '../middleware/authMiddleware.js';


const router = express.Router();

// Existing route

router.post('/run', protect, can('admin'), runReportQuery);
router.post('/generate-chart', protect, can('admin'), getChartConfigForData); // New
router.post('/refine-chart', protect, can('admin'), refineChart); // New


router.post('/save', protect, can('admin'), saveReport);
router.get('/saved', protect, can('admin'), getSavedReports);
router.delete('/:id', protect, can('admin'), deleteReport);


export default router;