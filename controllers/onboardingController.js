import UserRepository from '../repositories/userRepository.js';
import SchoolRepository from '../repositories/schoolRepository.js';

class OnboardingController {
  /**
   * Complete school onboarding - Main entry point
   */
  async completeOnboarding(req, res) {
    try {
      const onboardingData = req.body;

      // Check if school email already exists
      const existingSchool = await SchoolRepository.findByEmail(onboardingData.email);
      if (existingSchool) {
        return res.status(400).json({
          success: false,
          message: 'A school with this email already exists'
        });
      }

      // Check if admin email already exists
      const existingAdmin = await UserRepository.findByEmail(onboardingData.adminEmail);
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Step 1: Create admin user
      const adminUser = await UserRepository.create({
        fullName: onboardingData.adminName,
        email: onboardingData.adminEmail.toLowerCase(),
        password: onboardingData.adminPass,
        role: 'admin'
      });

      // Step 2: Create school
      const schoolUniqueId = await this.generateSchoolUniqueId(onboardingData.schoolName);

      const school = await SchoolRepository.create({
        schoolName: onboardingData.schoolName,
        schoolLevels: onboardingData.schoolLevels,
        motto: onboardingData.motto || '',
        country: onboardingData.country || 'Nigeria',
        state: onboardingData.state,
        feeStructure: onboardingData.feeStructure || ['Tuition', 'Uniforms', 'Books', 'PTA Levy'],
        lga: onboardingData.lga,
        address: onboardingData.address,
        curriculum: onboardingData.curriculum || 'Nigerian National',
        email: onboardingData.email.toLowerCase(), //school email 
        plan: onboardingData.plan || 'Starter',
        system: onboardingData.system || 'Standard',
        admin: adminUser._id,
        createdBy: adminUser._id,
        position: onboardingData.position || 'Principal', 
        phoneNumber: onboardingData.phoneNumber || '',
        schoolUniqueId
      }); 

      // Step 3: Link admin to school
      await UserRepository.update(adminUser._id, { school: school._id });

      // Dev-only: send School Unique ID to admin email (console stub, tries nodemailer if available)
      try {
        await this.sendSchoolUniqueIdEmail(onboardingData.adminEmail, school.schoolUniqueId);
      } catch (emailErr) {
        console.warn('Failed to send school unique id email (dev stub):', emailErr);
      }

      const result = {
        school: await SchoolRepository.findById(school._id),
        adminUser: await UserRepository.findById(adminUser._id)
      };

      res.status(201).json({
        success: true,
        message: 'Onboarding completed successfully',
        data: result
      });

    } catch (error) {
      console.error('Complete onboarding error:', error);
      res.status(500).json({
        success: false,
        message: 'Error completing onboarding',
        error: error.message
      });
    }
  }

  /**
   * Create a school without creating the admin user.
   * This endpoint generates the schoolUniqueId and sends it to the admin email (dev-stub),
   * then returns the created school so the frontend can create the admin user afterwards.
   */
  async createSchoolOnly(req, res) {
    try {
      const onboardingData = req.body;

      // Check if school email already exists
      const existingSchool = await SchoolRepository.findByEmail(onboardingData.email);
      if (existingSchool) {
        return res.status(400).json({
          success: false,
          message: 'A school with this email already exists'
        });
      }

      // Generate unique schoolUniqueId
      const schoolUniqueId = await this.generateSchoolUniqueId(onboardingData.schoolName);

      // Create school without admin linked yet
      const school = await SchoolRepository.create({
        schoolName: onboardingData.schoolName,
        schoolLevels: onboardingData.schoolLevels,
        motto: onboardingData.motto || '',
        country: onboardingData.country || 'Nigeria',
        state: onboardingData.state,
        feeStructure: onboardingData.feeStructure || ['Tuition', 'Uniforms', 'Books', 'PTA Levy'],
        lga: onboardingData.lga,
        address: onboardingData.address,
        curriculum: onboardingData.curriculum || 'Nigerian National',
        email: onboardingData.email.toLowerCase(),
        plan: onboardingData.plan || 'Starter',
        system: onboardingData.system || 'Standard',
        admin: null,
        createdBy: null,
        position: onboardingData.position || 'Principal',
        phoneNumber: onboardingData.phoneNumber || '',
        schoolUniqueId
      });

      // Dev-only: send School Unique ID to admin email (console stub, tries nodemailer if available)
      try {
        await this.sendSchoolUniqueIdEmail(onboardingData.adminEmail || onboardingData.email, school.schoolUniqueId);
      } catch (emailErr) {
        console.warn('Failed to send school unique id email (dev stub):', emailErr);
      }

      res.status(201).json({
        success: true,
        message: 'School created successfully (admin not created)',
        data: {
          school
        }
      });

    } catch (error) {
      console.error('Create school only error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating school',
        error: error.message
      });
    }
  }

  /**
   * Get onboarding status for a school
   */
  async getOnboardingStatus(req, res) {
    try {
      const { schoolId } = req.params;

      const school = await SchoolRepository.findById(schoolId);
      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School not found'
        });
      }

      const [adminUsers, teachers, students] = await Promise.all([
        UserRepository.findByRoleAndSchool('admin', schoolId),
        UserRepository.findByRoleAndSchool('teacher', schoolId),
        UserRepository.findByRoleAndSchool('student', schoolId)
      ]);

      const onboardingStatus = {
        school: {
          isComplete: !!(school.schoolName && school.address && school.email),
          data: school
        },
        admin: {
          isComplete: adminUsers.length > 0,
          count: adminUsers.length
        },
        teachers: {
          isComplete: teachers.length >= 1,
          count: teachers.length
        },
        students: {
          isComplete: students.length >= 5,
          count: students.length
        },
        overallProgress: this.calculateOnboardingProgress(school, adminUsers, teachers, students)
      };

      res.status(200).json({
        success: true,
        data: onboardingStatus
      });

    } catch (error) {
      console.error('Get onboarding status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching onboarding status',
        error: error.message
      });
    }
  }

  /**
   * Create users in bulk (teachers, students, parents)
   */
  async createBulkUsers(req, res) {
    try {
      const { schoolId } = req.params;
      const { users } = req.body;

      // Validate school exists
      const school = await SchoolRepository.findById(schoolId);
      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School not found'
        });
      }

      const results = await this.processBulkUsers(users, schoolId);

      res.status(201).json({
        success: true,
        message: `Created ${results.created.length} users successfully`,
        data: results
      });

    } catch (error) {
      console.error('Create bulk users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating bulk users',
        error: error.message
      });
    }
  }

  /**
   * Process bulk users creation using UserRepository
   */
  async processBulkUsers(users, schoolId) {
    const createdUsers = [];
    const errors = [];

    for (const userData of users) {
      try {
        // Check if user already exists using repository
        const existingUser = await UserRepository.findByEmail(userData.email);
        if (existingUser) {
          errors.push({ email: userData.email, error: 'User with this email already exists' });
          continue;
        }

        // Prepare user data
        const finalUserData = {
          ...userData,
          school: schoolId,
          email: userData.email.toLowerCase()
        };

        // Generate student ID if role is student
        if (userData.role === 'student') {
          finalUserData.studentId = await this.generateStudentId();
        }

        const user = await UserRepository.create(finalUserData);
        createdUsers.push(user);

      } catch (error) {
        errors.push({ email: userData.email, error: error.message });
      }
    }

    return { created: createdUsers, errors };
  }

  /**
   * Generate unique student ID
   */
  async generateStudentId() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    const studentId = `UC-${year}-${random}`;

    // Check if ID already exists using repository
    const existing = await UserRepository.findOne({ studentId });
    if (existing) {
      return this.generateStudentId(); // Recursively generate new ID if duplicate
    }

    return studentId;
  }

  /**
   * Update school profile using SchoolRepository
   */
  async updateSchoolProfile(req, res) {
    try {
      const { schoolId } = req.params;
      const updateData = req.body;

      const school = await SchoolRepository.findById(schoolId);
      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School not found'
        });
      }

      // If email is being updated, check for duplicates
      if (updateData.email && updateData.email !== school.email) {
        const emailExists = await SchoolRepository.findByEmail(updateData.email.toLowerCase());
        if (emailExists && emailExists._id.toString() !== schoolId) {
          return res.status(400).json({
            success: false,
            message: 'A school with this email already exists'
          });
        }
        updateData.email = updateData.email.toLowerCase();
      }

      const updatedSchool = await SchoolRepository.update(schoolId, updateData);

      res.status(200).json({
        success: true,
        message: 'School profile updated successfully',
        data: updatedSchool
      });

    } catch (error) {
      console.error('Update school profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating school profile',
        error: error.message
      });
    }
  }

  /**
   * Calculate onboarding progress
   */
  calculateOnboardingProgress(school, adminUsers, teachers, students) {
    const steps = {
      schoolInfo: !!(school.schoolName && school.address && school.email),
      adminSetup: adminUsers.length > 0,
      teachersAdded: teachers.length >= 1,
      studentsAdded: students.length >= 5
    };

    const completedSteps = Object.values(steps).filter(Boolean).length;
    return Math.round((completedSteps / Object.keys(steps).length) * 100);
  }

  /**
   * Extend trial period using SchoolRepository
   */
  async extendTrialPeriod(req, res) {
    try {
      const { schoolId } = req.params;
      const { additionalDays } = req.body;

      const school = await SchoolRepository.findById(schoolId);
      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School not found'
        });
      }

      const newExpirationDate = new Date(school.expiresAt);
      newExpirationDate.setDate(newExpirationDate.getDate() + parseInt(additionalDays));

      const updatedSchool = await SchoolRepository.updateExpiration(schoolId, newExpirationDate);

      res.status(200).json({
        success: true,
        message: `Trial period extended by ${additionalDays} days`,
        data: updatedSchool
      });

    } catch (error) {
      console.error('Extend trial period error:', error);
      res.status(500).json({
        success: false,
        message: 'Error extending trial period',
        error: error.message
      });
    }
  }

  /**
   * Get school statistics
   */
  async getSchoolStatistics(req, res) {
    try {
      const { schoolId } = req.params;

      const school = await SchoolRepository.findById(schoolId);
      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School not found'
        });
      }

      const [userCount, roleDistribution, activeUsers] = await Promise.all([
        UserRepository.countDocuments({ school: schoolId }),
        UserRepository.getUsersByRoleDistribution(schoolId),
        UserRepository.getActiveUsersBySchool(schoolId)
      ]);

      const statistics = {
        totalUsers: userCount,
        activeUsers: activeUsers.length,
        roleDistribution,
        schoolInfo: {
          name: school.schoolName,
          plan: school.plan,
          status: school.status,
          trialExpires: school.expiresAt
        }
      };

      res.status(200).json({
        success: true,
        data: statistics
      });

    } catch (error) {
      console.error('Get school statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching school statistics',
        error: error.message
      });
    }
  }

  /**
   * Search schools with filters
   */
  async searchSchools(req, res) {
    try {
      const { 
        search, 
        country, 
        state, 
        lga, 
        plan, 
        status, 
        schoolLevels,
        page = 1, 
        limit = 10 
      } = req.query;

      let filter = {};

      // Text search
      if (search) {
        filter.$or = [
          { schoolName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Location filters
      if (country) filter.country = country;
      if (state) filter.state = state;
      if (lga) filter.lga = lga;

      // Other filters
      if (plan) filter.plan = plan;
      if (status) filter.status = status;
      if (schoolLevels) {
        const levels = Array.isArray(schoolLevels) ? schoolLevels : [schoolLevels];
        filter.schoolLevels = { $in: levels };
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };

      const schools = await SchoolRepository.findAll(filter, options);
      const totalCount = await SchoolRepository.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          schools,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            hasNext: parseInt(page) < Math.ceil(totalCount / limit),
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Search schools error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching schools',
        error: error.message
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const { userId } = req.params;

      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // If email is being updated, check for duplicates
      if (updateData.email && updateData.email !== user.email) {
        const emailExists = await UserRepository.findByEmail(updateData.email);
        if (emailExists && emailExists._id.toString() !== userId) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
          });
        }
        updateData.email = updateData.email.toLowerCase();
      }

      const updatedUser = await UserRepository.update(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        data: updatedUser
      });

    } catch (error) {
      console.error('Update user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user profile',
        error: error.message
      });
    }
  }

  /**
   * Deactivate user
   */
  async deactivateUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const deactivatedUser = await UserRepository.deactivateUser(userId);

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: deactivatedUser
      });

    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deactivating user',
        error: error.message
      });
    }
  }

  /**
   * Activate user
   */
  async activateUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const activatedUser = await UserRepository.activateUser(userId);

      res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: activatedUser
      });

    } catch (error) {
      console.error('Activate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error activating user',
        error: error.message
      });
    }
  }

  /**
  /**
   * Generate a unique School Unique ID using first three letters of the school name,
   * the year, and a short alpha-numeric suffix. Example: WOD-2025-1DR3
   */
  async generateSchoolUniqueId(schoolName) {
    const year = new Date().getFullYear();
    // Extract first three alphabetical chars from the school name
    const lettersOnly = (schoolName || '').replace(/[^A-Za-z]/g, '');
    let prefix = lettersOnly.substring(0, 3).toUpperCase();
    if (prefix.length < 3) {
      prefix = (prefix + 'XXX').substring(0, 3);
    }

    const makeId = () => {
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 chars
      return `${prefix}-${year}-${rand}`;
    };

    let candidate = makeId();
    // Ensure uniqueness
    // SchoolRepository.exists returns a truthy value if found
    const maxAttempts = 5;
    let attempts = 0;
    // eslint-disable-next-line no-unmodified-loop-condition
    while (await SchoolRepository.exists({ schoolUniqueId: candidate })) {
      attempts += 1;
      if (attempts >= maxAttempts) {
        // Slightly change prefix to add entropy if collisions keep happening
        const extra = Math.random().toString(36).substring(2, 4).toUpperCase();
        candidate = `${prefix}-${year}-${extra}${Math.random().toString(36).substring(2, 3).toUpperCase()}`;
        break;
      }
      candidate = makeId();
    }

    return candidate;
  }

  /**
   * Dev-only: Send the school unique id to the admin email.
   * - If SMTP env vars are configured and `nodemailer` is installed, it will send an email.
   * - Otherwise it will log the message to the console as a development stub.
   */
  async sendSchoolUniqueIdEmail(adminEmail, schoolUniqueId) {
    if (!adminEmail || !schoolUniqueId) return;

    const subject = `Your School Unique ID for ${schoolUniqueId}`;
    const text = `Hello,\n\nYour school has been created. Your School Unique ID is: ${schoolUniqueId}\n\nUse this ID when needed.\n\nRegards,\nUgbekun`;

    // If SMTP settings are present, try to send an actual email using nodemailer
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      try {
        // Dynamically import nodemailer so installation is optional
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT, 10),
          secure: String(SMTP_PORT) === '465',
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: FROM_EMAIL || SMTP_USER,
          to: adminEmail,
          subject,
          text
        });

        console.log(`School Unique ID email sent to ${adminEmail}`);
        return;
      } catch (err) {
        // If nodemailer isn't installed or sending failed, fallthrough to console log
        console.warn('nodemailer send failed (falling back to console log):', err?.message || err);
      }
    }

    // Fallback: console log the message (development stub)
    console.log('--- Dev Email Stub ---');
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log('----------------------');
  }

}

export default new OnboardingController();