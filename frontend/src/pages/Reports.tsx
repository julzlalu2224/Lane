import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../lib/api';

export default function Reports() {
  const { data: profitData } = useQuery({
    queryKey: ['reports-profit'],
    queryFn: async () => {
      const response = await api.get('/reports/profit');
      return response.data;
    },
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['reports-inventory'],
    queryFn: async () => {
      const response = await api.get('/reports/inventory');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Analytics and insights</p>
      </div>

      {/* Profit Trends */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Profit Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={profitData?.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
            <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue vs Profit */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Profit</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={profitData?.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
            <Bar dataKey="profit" fill="#10b981" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Summary */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Total Products</p>
            <p className="mt-2 text-2xl font-bold text-blue-900">
              {inventoryData?.summary.totalProducts || 0}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-600">Stock Value (Cost)</p>
            <p className="mt-2 text-2xl font-bold text-green-900">
              ${inventoryData?.summary.totalStockValue.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-600">Potential Profit</p>
            <p className="mt-2 text-2xl font-bold text-purple-900">
              ${inventoryData?.summary.potentialProfit.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Stock Value</th>
                <th>Retail Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventoryData?.products.slice(0, 20).map((product: any) => (
                <tr key={product.id}>
                  <td className="font-medium">{product.name}</td>
                  <td>{product.category?.name}</td>
                  <td>{product.stock}</td>
                  <td>${product.stockValue.toFixed(2)}</td>
                  <td>${product.retailValue.toFixed(2)}</td>
                  <td>
                    {product.isLowStock ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
