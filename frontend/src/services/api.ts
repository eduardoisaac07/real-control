// real-control/frontend/src/services/api.ts

import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Adiciona o token JWT em todas as requisições se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tipagens para os recursos
export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  document?: string
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  title: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  dueDate?: string
  clientId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  title: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  validUntil?: string
  clientId: string
  userId: string
  createdAt: string
  updatedAt: string
}

// Serviço de autenticação
export const authService = {
  register: (name: string, email: string, password: string) =>
    api.post('/api/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/auth/logout'),
}

// CRUD de clientes
export const clientService = {
  list: () => api.get<Client[]>('/api/clients'),
  get: (id: string) => api.get<Client>(`/api/clients/${id}`),
  create: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Client>('/api/clients', data),
  update: (id: string, data: Partial<Client>) =>
    api.put<Client>(`/api/clients/${id}`, data),
  remove: (id: string) => api.delete<void>(`/api/clients/${id}`),
}

// CRUD de pedidos
export const orderService = {
  list: () => api.get<Order[]>('/api/orders'),
  get: (id: string) => api.get<Order>(`/api/orders/${id}`),
  create: (data: Omit<Order, 'id' | 'totalPrice' | 'createdAt' | 'updatedAt'>) =>
    api.post<Order>('/api/orders', data),
  update: (id: string, data: Partial<Order>) =>
    api.put<Order>(`/api/orders/${id}`, data),
  remove: (id: string) => api.delete<void>(`/api/orders/${id}`),
}

// CRUD de orçamentos
export const budgetService = {
  list: () => api.get<Budget[]>('/api/budgets'),
  get: (id: string) => api.get<Budget>(`/api/budgets/${id}`),
  create: (data: Omit<Budget, 'id' | 'totalPrice' | 'createdAt' | 'updatedAt'>) =>
    api.post<Budget>('/api/budgets', data),
  update: (id: string, data: Partial<Budget>) =>
    api.put<Budget>(`/api/budgets/${id}`, data),
  remove: (id: string) => api.delete<void>(`/api/budgets/${id}`),
}
