// import Joi from 'joi';

// const onboardingSchema = Joi.object({
//   schoolName: Joi.string().min(3).required().messages({
//     'string.empty': 'School name is required',
//     'string.min': 'School name must be at least 3 characters long'
//   }),
//   schoolLevels: Joi.array().items(Joi.string()).min(1).required().messages({
//     'array.min': 'At least one school level must be selected'
//   }),
//   motto: Joi.string().allow('').optional(),
//   country: Joi.string().required().messages({
//     'string.empty': 'Country is required'
//   }),
//   state: Joi.string().required().messages({
//     'string.empty': 'State is required'
//   }),
//   lga: Joi.string().required().messages({
//     'string.empty': 'LGA is required'
//   }),
//   address: Joi.string().min(5).required().messages({
//     'string.empty': 'Address is required',
//     'string.min': 'Address must be at least 5 characters long'
//   }),
//   adminName: Joi.string().min(2).required().messages({
//     'string.empty': 'Admin name is required',
//     'string.min': 'Admin name must be at least 2 characters long'
//   }),
//   adminRole: Joi.string().min(2).required().messages({
//     'string.empty': 'Admin role is required',
//     'string.min': 'Admin role must be at least 2 characters long'
//   }),
//   adminEmail: Joi.string().email().required().messages({
//     'string.email': 'A valid email is required',
//     'string.empty': 'Admin email is required'
//   }),
//   adminPhone: Joi.string().min(5).required().messages({
//     'string.empty': 'Phone number is required',
//     'string.min': 'Phone number must be at least 5 characters long'
//   }),
//   curriculum: Joi.string().required().messages({
//     'string.empty': 'Please select a curriculum'
//   }),
//   feeStructure: Joi.array().items(Joi.string()).optional(),
//   plan: Joi.string().valid('Starter', 'Growth', 'Enterprise').required(),
//   system: Joi.string().valid('Standard', 'SMSUP+').required(),
//   terms: Joi.boolean().valid(true).required().messages({
//     'any.only': 'You must agree to the terms and conditions'
//   })
// });

// export const validateOnboarding = (req, res, next) => {
//   const { error } = onboardingSchema.validate(req.body, { abortEarly: false });
  
//   if (error) {
//     const errors = error.details.map(detail => detail.message);
//     return res.status(400).json({
//       success: false,
//       error: errors.join(', ')
//     });
//   }
  
//   next();
// };

import { body, validationResult } from 'express-validator';

/**
 * Validation rules for onboarding data
 */
const validateOnboardingData = [
  // School validation
  body('schoolName')
    .notEmpty()
    .withMessage('School name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('School name must be between 2 and 100 characters')
    .trim(),

  body('schoolLevels')
    .isArray({ min: 1 })
    .withMessage('At least one school level must be selected'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid school email')
    .normalizeEmail(),

  body('state')
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  body('lga')
    .notEmpty()
    .withMessage('LGA is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('LGA must be between 2 and 50 characters'),

  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),

  // Admin user validation
  body('adminName')
    .notEmpty()
    .withMessage('Admin name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Admin name must be between 2 and 100 characters')
    .trim(),

  body('adminEmail')
    .isEmail()
    .withMessage('Please provide a valid admin email')
    .normalizeEmail(),

  body('adminPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Optional fields with validation
  body('motto')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Motto must not exceed 200 characters'),

  body('plan')
    .optional()
    .isIn(['Starter', 'Growth', 'Enterprise'])
    .withMessage('Invalid plan type'),

  body('system')
    .optional()
    .isIn(['Standard', 'SMSUP+'])
    .withMessage('Invalid system type'),

  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  }
];

/**
 * Validation for bulk user creation
 */
const validateBulkUsers = [
  body('users')
    .isArray({ min: 1 })
    .withMessage('Users array is required and must not be empty'),

  body('users.*.fullName')
    .notEmpty()
    .withMessage('Full name is required for all users')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('users.*.email')
    .isEmail()
    .withMessage('Please provide valid email addresses for all users')
    .normalizeEmail(),

  body('users.*.password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long for all users'),

  body('users.*.role')
    .isIn(['teacher', 'student', 'parent'])
    .withMessage('Role must be teacher, student, or parent'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Bulk user validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation for school profile update
 */
const validateSchoolProfileUpdate = [
  body('schoolName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('School name must be between 2 and 100 characters')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('state')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  body('lga')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('LGA must be between 2 and 50 characters'),

  body('address')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),

  body('plan')
    .optional()
    .isIn(['Starter', 'Growth', 'Enterprise'])
    .withMessage('Invalid plan type'),

  body('system')
    .optional()
    .isIn(['Standard', 'SMSUP+'])
    .withMessage('Invalid system type'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'School profile validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  }
];

// Export all validation middleware
export {
  validateOnboardingData,
  validateBulkUsers,
  validateSchoolProfileUpdate
};