import { Router } from 'express';
import * as restaurantController from '../controllers/restaurantController';

const router = Router();

// GET /api/restaurants
router.get('/', restaurantController.getAll);

// GET /api/restaurants/nearby?lon=xxx&lat=xxx&km=xxx
router.get('/nearby', restaurantController.nearby);

// GET /api/restaurants/:id
router.get('/:id', restaurantController.getById);

export default router;