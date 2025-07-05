import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShoppingCart, FileText, TrendingUp } from 'lucide-react';
import {
  clientService,
  orderService,
  budgetService,
  Client,
  Order,
  Budget,
} from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalOrders: 0,
    totalBudgets: 0,
    pendingOrders: 0,
  });
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsResponse, ordersResponse, budgetsResponse] = await Promise.all([
          clientService.list(),
          orderService.list(),
          budgetService.list(),
        ]);
        const clients = clientsResponse.data;
        const orders = ordersResponse.data;
        const budgets = budgetsResponse.data;

        setStats({
          totalClients: clients.length,
          totalOrders: orders.length,
          totalBudgets: budgets.length,
          pendingOrders: orders.filter(
            (order: Order) => order.status === 'PENDING'
          ).length,
        });

        setRecentClients(clients.slice(0, 5));
        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      name: 'Total de Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-blue-500',
      href: '/clients',
    },
    {
      name: 'Total de Pedidos',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      href: '/orders',
    },
    {
      name: 'Total de Orçamentos',
      value: stats.totalBudgets,
      icon: FileText,
      color: 'bg-purple-500',
      href: '/budgets',
    },
    {
      name: 'Pedidos Pendentes',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '/orders',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PRODUCTION':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'IN_PRODUCTION':
        return 'Em Produção';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Visão geral do sistema Real Control
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.name}
              to={card.href}
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-md ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.name}</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clientes recentes */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Clientes Recentes
            </h2>
            <Link
              to="/clients"
              className="text-sm text-blue-600 hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentClients.length > 0 ? (
              recentClients.map((client) => (
                <li key={client.id} className="py-4 flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {client.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {client.email || 'Sem email'}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum cliente cadastrado</p>
            )}
          </ul>
        </div>

        {/* Pedidos recentes */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pedidos Recentes
            </h2>
            <Link
              to="/orders"
              className="text-sm text-blue-600 hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <li key={order.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.product}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cliente: {order.client.name}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum pedido cadastrado</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
