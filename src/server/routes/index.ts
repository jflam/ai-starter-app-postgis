import { Router } from 'express';
import restaurantRoutes from './restaurantRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Restaurant routes
router.use('/restaurants', restaurantRoutes);

export default router;