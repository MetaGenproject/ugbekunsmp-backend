import express from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getEvents)
    .post(createEvent);

router.route('/:id')
    .put(updateEvent)
    .delete(deleteEvent);

export default router;
