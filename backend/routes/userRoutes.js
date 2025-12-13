import express from 'express';
import { 
  getAllUsers, 
  getUser, 
  updateUser, 
  deleteUser, 
  updateBalance,
  addFavorite,
  removeFavorite
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/balance', updateBalance);

// Favorites routes
router.post('/:id/favorites/:tutorId', addFavorite);
router.delete('/:id/favorites/:tutorId', removeFavorite);

export default router;
