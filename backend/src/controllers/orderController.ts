import { Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product, quantity, deadline, status, clientId } = req.body;
    const userId = req.userId;

    // Validar dados de entrada
    if (!product || !quantity || !clientId) {
      res.status(400).json({ error: 'Produto, quantidade e cliente são obrigatórios' });
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

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        product,
        quantity: parseInt(quantity),
        deadline: deadline ? new Date(deadline) : null,
        status: status || OrderStatus.PENDING,
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
      message: 'Pedido criado com sucesso',
      order
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const orders = await prisma.order.findMany({
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

    res.json({ orders });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await prisma.order.findFirst({
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

    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { product, quantity, deadline, status, clientId } = req.body;
    const userId = req.userId;

    // Verificar se o pedido existe e pertence ao usuário
    const existingOrder = await prisma.order.findFirst({
      where: {
        id,
        userId: userId!
      }
    });

    if (!existingOrder) {
      res.status(404).json({ error: 'Pedido não encontrado' });
      return;
    }

    // Se clientId foi fornecido, verificar se o cliente existe e pertence ao usuário
    if (clientId && clientId !== existingOrder.clientId) {
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

    // Atualizar pedido
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        product: product || existingOrder.product,
        quantity: quantity ? parseInt(quantity) : existingOrder.quantity,
        deadline: deadline ? new Date(deadline) : existingOrder.deadline,
        status: status || existingOrder.status,
        clientId: clientId || existingOrder.clientId
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
      message: 'Pedido atualizado com sucesso',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verificar se o pedido existe e pertence ao usuário
    const existingOrder = await prisma.order.findFirst({
      where: {
        id,
        userId: userId!
      }
    });

    if (!existingOrder) {
      res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Deletar pedido
    await prisma.order.delete({
      where: { id }
    });

    res.json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

