import express from 'express';
import { getMySchool, getDashboardStats, getSchoolByAdmin } from '../controllers/schoolController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Admin routes - get their own school data
router.get('/my-school', protect, authorize('admin'), getMySchool);
router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);

// Super admin routes - get school by admin ID
router.get('/by-admin/:adminId', protect, authorize('super-admin'), getSchoolByAdmin);

export default router;
