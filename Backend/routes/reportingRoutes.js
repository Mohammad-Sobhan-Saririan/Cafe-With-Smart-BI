import express from 'express';
// Add the new controller functions
import { runReportQuery, saveReport, getChartConfigForData, refineChart, deleteReport, getSavedReports } from '../controllers/reportingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';


const router = express.Router();

// Existing route

router.post('/run', protect, admin, runReportQuery);
router.post('/generate-chart', protect, admin, getChartConfigForData); // New
router.post('/refine-chart', protect, admin, refineChart); // New


router.post('/save', protect, admin, saveReport);
router.get('/saved', protect, admin, getSavedReports);
router.delete('/:id', protect, admin, deleteReport);


export default router;