import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { RequestHandler } from 'express';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
} from '../controllers/clientController';

const router = Router();

// Todas as rotas de clientes requerem autenticação
router.use(authenticateToken as RequestHandler);

router.post('/', createClient);
router.get('/', getClients);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;

