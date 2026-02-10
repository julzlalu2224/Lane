import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Package, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import type { DashboardData } from '../types';

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/reports/dashboard');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your business metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                ${data?.daily.revenue.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {data?.daily.sales} sales
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                ${data?.monthly.revenue.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {data?.monthly.sales} sales
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {data?.inventory.totalProducts}
              </p>
              <p className="mt-1 text-sm text-gray-500">In inventory</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {data?.inventory.lowStockCount}
              </p>
              <p className="mt-1 text-sm text-gray-500">Need attention</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Best Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.bestSelling.map((item) => (
                <tr key={item.product.id}>
                  <td className="font-medium">{item.product.name}</td>
                  <td>{item.product.category?.name}</td>
                  <td>{item.totalQuantity}</td>
                  <td>${item.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h2>
        <div className="space-y-3">
          {data?.recentSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Sale #{sale.id.substring(0, 8)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(sale.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {sale.items.length} item(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  ${sale.total.toFixed(2)}
                </p>
                <p className="text-xs text-green-600">
                  Profit: ${sale.profit.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
