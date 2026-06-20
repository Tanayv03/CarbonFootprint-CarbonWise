import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import xss from 'xss-clean';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import aiRoutes from './routes/aiRoutes.js';
import footprintRoutes from './routes/footprintRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Vite Dev server needs CSP disabled or configured for websockets
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, 
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(compression()); // Compress all responses

// Strict CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? 'https://carbonwise.vercel.app' : 'http://localhost:5173', // Adjust production URL accordingly
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Limit body payload to prevent DOS
app.use(mongoSanitize()); // Data Sanitization against NoSQL query injection
app.use(xss()); // Data Sanitization against XSS
app.use(hpp()); // Prevent parameter pollution
app.use('/api/', apiLimiter); // Apply rate limiter only to API routes

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/footprint', footprintRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    error: err.message || 'Internal Server Error'
  });
});

// Serve Static Frontend (in production/Docker) with strict caching
app.use(express.static(path.join(__dirname, '../client/dist'), {
  maxAge: '1y', // Cache assets for 1 year
  etag: false
}));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
});
