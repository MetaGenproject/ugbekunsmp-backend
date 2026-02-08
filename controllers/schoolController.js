import SchoolRepository from '../repositories/schoolRepository.js';
import UserRepository from '../repositories/userRepository.js';
import Student from '../models/studentModel.js';
import Event from '../models/eventModel.js';
import Transaction from '../models/transactionModel.js';

// @desc    Get current admin's school
// @route   GET /api/schools/my-school
// @access  Private/Admin
export const getMySchool = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user to find their school
        const user = await UserRepository.findById(userId);

        if (!user || !user.school) {
            return res.status(404).json({
                success: false,
                message: 'No school associated with this admin'
            });
        }

        // Get the school details
        const school = await SchoolRepository.findById(user.school);

        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'School not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                school
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching school data',
            error: error.message
        });
    }
};

// @desc    Get dashboard statistics for admin's school
// @route   GET /api/schools/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user to find their school
        const user = await UserRepository.findById(userId);

        if (!user || !user.school) {
            return res.status(404).json({
                success: false,
                message: 'No school associated with this admin'
            });
        }

        // Handle case where school might be populated or just an ID
        const schoolId = user.school._id || user.school;

        // Get statistics in parallel
        const [studentsCount, teachersCount, totalUsers, revenueResult, eventsCount] = await Promise.all([
            Student.countDocuments({ school: schoolId }),
            UserRepository.countDocuments({ school: schoolId, role: 'teacher' }),
            UserRepository.countDocuments({ school: schoolId }),
            Transaction.aggregate([
                { $match: { school: schoolId, type: 'revenue', status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Event.countDocuments({ school: schoolId })
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                studentsCount,
                teachersCount,
                totalRevenue,
                eventsCount,
                totalUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

// @desc    Get school by admin ID
// @route   GET /api/schools/by-admin/:adminId
// @access  Private/SuperAdmin
export const getSchoolByAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;

        const school = await SchoolRepository.findByAdmin(adminId);

        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'No school found for this admin'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                school
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching school',
            error: error.message
        });
    }
};
