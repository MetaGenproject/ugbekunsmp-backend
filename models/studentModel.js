import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  class: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  initials: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Alumni"],
    default: "Active",
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  parentName: {
    type: String,
    required: true,
  },
  parentPhone: {
    type: String,
    required: true,
  },
  parentEmail: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  previousSchool: {
    type: String,
    required: false,
  },
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;



 