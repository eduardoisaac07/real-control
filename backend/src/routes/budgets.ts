import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { RequestHandler } from 'express';
import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController';

const router = Router();

// Todas as rotas de orçamentos requerem autenticação
router.use('/', authenticateToken as RequestHandler);

router.post('/', createBudget);
router.get('/', getBudgets);
router.get('/:id', getBudgetById);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;

