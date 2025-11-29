import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    trim: true,
  },
  schoolLevels: [{
    type: String,
    required: [true, 'At least one school level must be selected']
  }],
  motto: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    default: 'Nigeria'
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  lga: {
    type: String,
    required: [true, 'LGA is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    minlength: [5, 'Address must be at least 5 characters long']
  },
  admin: {
    type:  mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User'
  },
   curriculum: {
      type: String,
      required: [true, 'Curriculum is required'],
      default: 'Nigerian National'
    },
   feeStructure: [{
      type: String,
      default: [true, 'At least one fee structure must be selected']
    }], 

  email: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["Active", "Alumni"],
    default: "Active",
  },
 
  plan: {
    type: String,
    enum: ["Starter", "Growth", "Enterprise"],
    required: true,
  },
  system: {
      type: String,
      enum: ['Standard', 'SMSUP+'],
      required: true,
      default: 'Standard'
    },
  expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
    },
    isActive: {
    type: Boolean,
    default: true
  },
  schoolUniqueId: {
      type: String,
      index: true,
      unique: true,
    },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, { timestamps: true });

// Recommended indexes
schoolSchema.index({ admin: 1 }); // For finding schools by admin
schoolSchema.index({ email: 1 }); // For email-based lookups
schoolSchema.index({ country: 1, state: 1, lga: 1 }); // For geographic queries
schoolSchema.index({ status: 1 }); // For filtering by status
schoolSchema.index({ plan: 1 }); // For filtering by subscription plan
schoolSchema.index({ expiresAt: 1 }); // For finding expired trials
schoolSchema.index({ isActive: 1 }); // For active/inactive school queries
schoolSchema.index({ createdBy: 1 }); // For finding schools by creator
schoolSchema.index({ 'schoolLevels': 1 }); // For filtering by school levels

// Compound indexes for common query patterns
schoolSchema.index({ isActive: 1, status: 1 });
schoolSchema.index({ country: 1, isActive: 1 });
schoolSchema.index({ expiresAt: 1, isActive: 1 }); // For cleanup jobs

const School = mongoose.model("School", schoolSchema);

export default School;



 