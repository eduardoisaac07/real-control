import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const createBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { description, value, date, clientId } = req.body;
    const userId = req.userId;

    // Validar dados de entrada
    if (!description || !value || !date || !clientId) {
      res.status(400).json({ error: 'Descrição, valor, data e cliente são obrigatórios' });
    }

    // Verificar se o cliente existe e pertence ao usuário
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: userId!
      }
    });

    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Criar orçamento
    const budget = await prisma.budget.create({
      data: {
        description,
        value: parseFloat(value),
        date: new Date(date),
        clientId,
        userId: userId!
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Orçamento criado com sucesso',
      budget
    });
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const budgets = await prisma.budget.findMany({
      where: { userId: userId! },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ budgets });
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getBudgetById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: userId!
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!budget) {
      res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    res.json({ budget });
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { description, value, date, clientId } = req.body;
    const userId = req.userId;

    // Verificar se o orçamento existe e pertence ao usuário
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: userId!
      }
    });

    if (!existingBudget) {
      res.status(404).json({ error: 'Orçamento não encontrado' });
      return;
    }

    // Se clientId foi fornecido, verificar se o cliente existe e pertence ao usuário
    if (clientId && clientId !== existingBudget.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          userId: userId!
        }
      });

      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }
    }

    // Atualizar orçamento
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        description: description || existingBudget.description,
        value: value ? parseFloat(value) : existingBudget.value,
        date: date ? new Date(date) : existingBudget.date,
        clientId: clientId || existingBudget.clientId
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      message: 'Orçamento atualizado com sucesso',
      budget: updatedBudget
    });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verificar se o orçamento existe e pertence ao usuário
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: userId!
      }
    });

    if (!existingBudget) {
      res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    // Deletar orçamento
    await prisma.budget.delete({
      where: { id }
    });

    res.json({ message: 'Orçamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

