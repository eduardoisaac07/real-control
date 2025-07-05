import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { RequestHandler } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} from '../controllers/orderController';

const router = Router();

// Todas as rotas de pedidos requerem autenticação
router.use(authenticateToken as RequestHandler);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;

