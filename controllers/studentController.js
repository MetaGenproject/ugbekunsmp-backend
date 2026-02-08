import StudentRepository from '../repositories/studentRepository.js';
import UserRepository from '../repositories/userRepository.js';

// @desc    Get all students for a school
// @route   GET /api/students
// @access  Private/Admin
export const getStudents = async (req, res) => {
    try {
        console.log('GET /api/students - User:', req.user?._id, 'Role:', req.user?.role);
        const schoolId = req.user.school._id || req.user.school;

        if (!schoolId) {
            console.log('GET /api/students - No school ID found for user');
            return res.status(400).json({
                success: false,
                message: 'No school associated with this user'
            });
        }

        console.log('GET /api/students - Fetching for school:', schoolId);
        const students = await StudentRepository.findBySchool(schoolId);
        console.log(`GET /api/students - Found ${students.length} students`);

        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('GET /api/students - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
export const createStudent = async (req, res) => {
    try {
        console.log('POST /api/students - Body:', JSON.stringify(req.body, null, 2));
        const schoolId = req.user.school._id || req.user.school;

        if (!schoolId) {
            console.log('POST /api/students - No school ID found for user');
            return res.status(400).json({
                success: false,
                message: 'No school associated with this user'
            });
        }

        const studentData = {
            ...req.body,
            school: schoolId
        };

        // If name is provided, generate initials
        if (studentData.name) {
            studentData.initials = studentData.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase();
        }

        // Generate studentId if not provided (e.g., UC-2026-XXXX)
        if (!studentData.studentId) {
            const year = new Date().getFullYear();
            const random = Math.floor(1000 + Math.random() * 9000);
            studentData.studentId = `UC-${year}-${random}`;
        }

        console.log('POST /api/students - Creating student for school:', schoolId);
        const student = await StudentRepository.create(studentData);
        console.log('POST /api/students - Student created successfully:', student._id);
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating student',
            error: error.message
        });
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private/Admin
export const updateStudent = async (req, res) => {
    try {
        const student = await StudentRepository.update(req.params.id, req.body);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: error.message
        });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private/Admin
export const deleteStudent = async (req, res) => {
    try {
        const student = await StudentRepository.delete(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
};
