import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { createSchool, updateSchool, getSchool, getSchools, deleteSchool, getPlatformStats } from '../controllers/superadminController.js';

const router = express.Router();

// router.post('/login', login);
// router.get('/me', protect, getMe);

//router.post('/createschool', protect, createSchool);
router.post('/createschool', createSchool);
router.put('/updateschool/:id', updateSchool);
router.get('/getschool/:id', getSchool);
router.get('/getschools', getSchools);
router.delete('/deleteschool/:id', deleteSchool);
router.get('/platform-stats', protect, authorize('super-admin'), getPlatformStats);




export default router;