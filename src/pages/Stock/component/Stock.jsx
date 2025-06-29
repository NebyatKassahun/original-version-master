import React, { useState } from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const initialStock = [
  { id: 1, name: 'Product A', stock: 500 },
  { id: 2, name: 'Product B', stock: 180 },
  { id: 3, name: 'Product C', stock: 9 },
  { id: 4, name: 'Product D', stock: 0 }
];

const Stock = () => {
  const [stockItems, setStockItems] = useState(initialStock);
  const [newProduct, setNewProduct] = useState({ name: '', stock: '' });

  const totalItems = stockItems.reduce((sum, item) => sum + item.stock, 0);
  const inStock = stockItems.filter(item => item.stock > 10).length;
  const lowStock = stockItems.filter(item => item.stock > 0 && item.stock <= 10).length;
  const outOfStock = stockItems.filter(item => item.stock === 0).length;

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || isNaN(Number(newProduct.stock))) return;
    setStockItems([
      ...stockItems,
      { id: Date.now(), name: newProduct.name, stock: Number(newProduct.stock) }
    ]);
    setNewProduct({ name: '', stock: '' });
  };

  const handleDelete = (id) => {
    setStockItems(stockItems.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Stock Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-2xl font-bold">{inStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold">{lowStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold">{outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Levels</h2>
        <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="border px-3 py-2 rounded-lg flex-1"
            required
          />
          <input
            type="number"
            name="stock"
            value={newProduct.stock}
            onChange={handleChange}
            placeholder="Stock"
            className="border px-3 py-2 rounded-lg flex-1"
            required
            min="0"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Product
          </button>
        </form>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Product</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="py-2">{item.name}</td>
                <td className="py-2">{item.stock}</td>
                <td className="py-2">
                  {item.stock === 0 ? (
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                  ) : item.stock <= 10 ? (
                    <span className="text-orange-600 font-semibold">Low Stock</span>
                  ) : (
                    <span className="text-green-600 font-semibold">In Stock</span>
                  )}
                </td>
                <td className="py-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {stockItems.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-4">
                  No products in stock.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stock;