import express from 'express';
import OnboardingController from '../controllers/onboardingController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/onboarding/complete
 * @desc    Complete school onboarding process
 * @access  Public (initially, then protected for subsequent steps)
 */
router.post('/complete',   OnboardingController.completeOnboarding.bind(OnboardingController));
// Create school only (generate schoolUniqueId and email admin) before creating admin user
router.post('/create-school', OnboardingController.createSchoolOnly.bind(OnboardingController));

/**
 * @route   GET /api/onboarding/schools/:schoolId/status
 * @desc    Get onboarding status for a school
 * @access  Private (School Admin)
 */
router.get( '/schools/:schoolId/status', protect, OnboardingController.getOnboardingStatus.bind(OnboardingController));


/**
 * @route   POST /api/onboarding/schools/:schoolId/users/bulk
 * @desc    Create multiple users (teachers, students, parents) in bulk
 * @access  Private (School Admin)
 */
router.post('/schools/:schoolId/users/bulk', protect, OnboardingController.createBulkUsers.bind(OnboardingController));


/**
 * @route   PATCH /api/onboarding/schools/:schoolId/profile
 * @desc    Update school profile information
 * @access  Private (School Admin)
 */
router.patch(
  '/schools/:schoolId/profile', protect, OnboardingController.updateSchoolProfile.bind(OnboardingController));

/**
 * @route   POST /api/onboarding/schools/:schoolId/extend-trial
 * @desc    Extend school trial period
 * @access  Private (Super Admin)
 */
router.post('/schools/:schoolId/extend-trial', protect, OnboardingController.extendTrialPeriod.bind(OnboardingController)
);

/**
 * @route   GET /api/onboarding/schools/:schoolId/statistics
 * @desc    Get school statistics and user distribution
 * @access  Private (School Admin)
 */
router.get( '/schools/:schoolId/statistics', protect,OnboardingController.getSchoolStatistics.bind(OnboardingController));

/**
 * @route   GET /api/onboarding/schools/search
 * @desc    Search and filter schools
 * @access  Private (Super Admin/Admin)
 */
router.get('/schools/search',protect, OnboardingController.searchSchools.bind(OnboardingController));

/**
 * @route   GET /api/onboarding/schools
 * @desc    Get all schools with pagination (for super admin)
 * @access  Private (Super Admin)
 */
router.get('/schools', protect,
  async (req, res) => {
    // This can be handled by SchoolController, but included for completeness
    res.status(200).json({
      success: true,
      message: 'Use /api/schools endpoint for school management'
    });
  }
);

/**
 * @route   GET /api/onboarding/user/role-stats
 * @desc    Get role distribution statistics for user's school
 * @access  Private (School Admin/Teacher)
 */
router.get( '/user/role-stats',protect,
  async (req, res) => {
    try {
      const schoolId = req.user.school;
      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with a school'
        });
      }

      const roleDistribution = await UserRepository.getUsersByRoleDistribution(schoolId);
      
      res.status(200).json({
        success: true,
        data: roleDistribution
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching role statistics',
        error: error.message
      });
    }
  }
);


export default router;