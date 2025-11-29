import express from 'express';
import { createSuperAdmin, getUsers, signupUser } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create-super-admin', createSuperAdmin);
router.get('/', protect, authorize('super-admin'), getUsers);
router.post('/signup', signupUser); 


export default router;