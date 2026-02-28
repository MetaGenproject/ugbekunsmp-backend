import express from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../controllers/studentController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

import Student from '../models/studentModel.js';

router.get('/debug/count', async (req, res) => {
    try {
        const count = await Student.countDocuments();
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.use(protect);
router.use(authorize('admin'));

router.get('/', getStudents);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
