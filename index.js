import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
// import winston from 'winston';
// import compression from 'compression';
// import multer from 'multer';
// import fs from 'fs';
// import csv from 'csv-parser';
// import xlsx from 'xlsx';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/userRoute.js';
import superadminRoutes from './routes/superadminRoute.js';
import onboardingRoutes from './routes/onboardingRoute.js';
import schoolRoutes from './routes/schoolRoute.js';
import studentRoute from './routes/studentRoute.js';
import eventRoute from './routes/eventRoute.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000; // Use env PORT or fallback to 6000
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



// --- Development-focused setup ---

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ensure this server doesn't accidentally run in production
if (process.env.NODE_ENV === 'production') {
  console.error("This server is intended for development only. Set NODE_ENV to 'development' or unset it.");
  process.exit(1);
}



// --- Middleware ---

// CORS configuration for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://ugbekun-beta.vercel.app/'], // Next.js default port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

// This handles preflight explicitly
app.options("*", cors());
// Ensure OPTIONS preflight requests are handled (explicit handler helps some environments)
// app.options('*', cors({
//   origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   credentials: true
// }));

// Body parser
app.use(express.json());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Cookie parser - must come before CSRF protection
app.use(cookieParser(process.env.COOKIE_SECRET));

// CSRF Protection - configured to read token from cookies and headers
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.SECURE_COOKIES === 'true',
    sameSite: 'lax'
  }
});

// View engine setup
app.set('view engine', 'ejs');


// --- Database Connection ---

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected (Development) `);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};


// CSRF token endpoint (public, no CSRF protection on GET)
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes (CSRF protection applied selectively in routes)
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/students', studentRoute);
app.use('/api/events', eventRoute);

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'UGB2025 Backend API is active for development.',
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// --- Server Initialization ---

const Server = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Development server listening on http://localhost:${PORT}`);
    console.log('CORS allowed origins: http://localhost:3000, http://127.0.0.1:3000');
  });
};

Server();
