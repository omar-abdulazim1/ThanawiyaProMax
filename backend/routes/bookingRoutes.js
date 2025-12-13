import express from 'express';
import { 
  getAllBookings, 
  getBooking, 
  createBooking, 
  updateBooking, 
  deleteBooking 
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getAllBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', authorize('admin'), deleteBooking);

export default router;
