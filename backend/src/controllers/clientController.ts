import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.userId;
    console.log('Recebido userId:', userId); // Adicione esta linha

    // Validar dados de entrada
    if (!name) {
      res.status(400).json({ error: 'Nome é obrigatório' });
      return;
    }

    // Verificar se já existe um cliente com este email (se fornecido)
    if (email) {
      const existingClient = await prisma.client.findUnique({
        where: { email }
      });

      if (existingClient) {
        res.status(400).json({ error: 'Já existe um cliente com este email' });
      return;
      }
    }

    // Criar cliente
    const client = await prisma.client.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        userId: userId!
      }
    });

    res.status(201).json({
      message: 'Cliente criado com sucesso',
      client
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    if (error instanceof Error) {
      console.error('Detalhes do erro:', error.message);
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const clients = await prisma.client.findMany({
      where: { userId: userId! },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ clients });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: userId!
      },
      include: {
        orders: true,
        budgets: true
      }
    });

    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ client });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const userId = req.userId;

    // Verificar se o cliente existe e pertence ao usuário
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: userId!
      }
    });

    if (!existingClient) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    // Verificar se já existe outro cliente com este email (se fornecido)
    if (email && email !== existingClient.email) {
      const emailExists = await prisma.client.findUnique({
        where: { email }
      });

      if (emailExists) {
        res.status(400).json({ error: 'Já existe um cliente com este email' });
        return;
      }
    }

    // Atualizar cliente
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name: name || existingClient.name,
        email: email || existingClient.email,
        phone: phone || existingClient.phone
      }
    });

    res.json({
      message: 'Cliente atualizado com sucesso',
      client: updatedClient
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verificar se o cliente existe e pertence ao usuário
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: userId!
      }
    });

    if (!existingClient) {
      res.status(404).json({ error: 'Cliente não encontrado' });
    return;
    }

    // Deletar cliente (cascata deletará pedidos e orçamentos relacionados)
    await prisma.client.delete({
      where: { id }
    });

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    if (error instanceof Error) {
      console.error('Detalhes do erro:', error.message);
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

