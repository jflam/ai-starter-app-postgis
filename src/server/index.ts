import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Apply middleware
app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API routes - simple version for now
app.get('/api/restaurants', (_req, res) => {
  res.json([
    {
      id: 1,
      name: 'Test Restaurant',
      city: 'Seattle',
      cuisine_type: 'Pizza',
      location: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062]
      }
    }
  ]);
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for testing
export default app;