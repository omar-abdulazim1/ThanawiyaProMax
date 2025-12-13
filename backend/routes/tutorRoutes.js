import express from 'express';
import { 
  getAllTutors, 
  getTutor, 
  getTutorByUserId,
  createTutor, 
  updateTutor, 
  deleteTutor 
} from '../controllers/tutorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllTutors);
router.get('/:id', getTutor);
router.get('/user/:userId', getTutorByUserId);

// Protected routes
router.post('/', protect, createTutor);
router.put('/:id', protect, updateTutor);
router.delete('/:id', protect, authorize('admin'), deleteTutor);

export default router;
