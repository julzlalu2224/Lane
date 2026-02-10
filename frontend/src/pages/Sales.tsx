import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import api from '../lib/api';
import Modal from '../components/Modal';
import type { Sale, Product, CreateSaleRequest } from '../types';

export default function Sales() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await api.get('/sales');
      return response.data;
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: (data: CreateSaleRequest) => api.post('/sales', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsModalOpen(false);
      setCartItems([]);
    },
  });

  const handleAddToCart = (productId: string) => {
    const existing = cartItems.find((item) => item.productId === productId);
    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { productId, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter((item) => item.productId !== productId));
    } else {
      setCartItems(
        cartItems.map((item) => (item.productId === productId ? { ...item, quantity } : item))
      );
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const handleCreateSale = () => {
    if (cartItems.length === 0) {
      alert('Please add at least one item to the sale');
      return;
    }

    createSaleMutation.mutate({ items: cartItems });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products?.find((p) => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage sales</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Sale
        </button>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h2>
        <div className="space-y-3">
          {sales?.map((sale) => (
            <div key={sale.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Sale #{sale.id.substring(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(sale.createdAt).toLocaleString()}
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
              <div className="space-y-1">
                {sale.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Sale">
        <div className="space-y-4">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Products
            </label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      Stock: {product.stock} | ${product.price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="btn btn-primary text-sm py-1 px-3"
                    disabled={product.stock === 0}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Cart</h3>
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No items in cart</p>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item) => {
                  const product = products?.find((p) => p.id === item.productId);
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product?.name}</p>
                        <p className="text-xs text-gray-500">
                          ${product?.price.toFixed(2)} × {item.quantity} = $
                          {((product?.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max={product?.stock}
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(item.productId, parseInt(e.target.value))
                          }
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total */}
          {cartItems.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCreateSale}
                className="w-full btn btn-primary flex items-center justify-center"
                disabled={createSaleMutation.isPending}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {createSaleMutation.isPending ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
