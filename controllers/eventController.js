import EventRepository from '../repositories/eventRepository.js';

export const getEvents = async (req, res) => {
    try {
        const schoolId = req.user.school._id || req.user.school;
        const events = await EventRepository.findBySchool(schoolId);
        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
};

export const createEvent = async (req, res) => {
    try {
        const schoolId = req.user.school._id || req.user.school;
        const eventData = { ...req.body, school: schoolId };
        const event = await EventRepository.create(eventData);
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const event = await EventRepository.update(req.params.id, req.body);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const event = await EventRepository.delete(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
};
