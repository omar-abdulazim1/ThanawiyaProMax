import express from 'express';
import { 
  getAllPayments, 
  getPayment, 
  createPayment, 
  updatePayment, 
  deletePayment,
  approvePayment,
  rejectPayment
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getAllPayments);
router.get('/:id', getPayment);
router.post('/', createPayment);
router.put('/:id/approve', authorize('admin'), approvePayment);
router.put('/:id/reject', authorize('admin'), rejectPayment);
router.put('/:id', authorize('admin'), updatePayment);
router.delete('/:id', authorize('admin'), deletePayment);

export default router;
