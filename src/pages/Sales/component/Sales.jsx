import React, { useState } from 'react';

const initialSales = [
  { id: 1, customer: 'John Doe', product: 'Notebook', quantity: 3, date: '2024-06-01' },
  { id: 2, customer: 'Jane Smith', product: 'Pen', quantity: 10, date: '2024-06-05' }
];

const Sales = () => {
  const [sales, setSales] = useState(initialSales);
  const [newSale, setNewSale] = useState({
    customer: '',
    product: '',
    quantity: '',
    date: ''
  });

  const handleChange = (e) => {
    setNewSale({ ...newSale, [e.target.name]: e.target.value });
  };

  const handleAddSale = (e) => {
    e.preventDefault();
    if (!newSale.customer || !newSale.product || !newSale.quantity || !newSale.date) return;
    setSales([
      ...sales,
      { ...newSale, id: Date.now(), quantity: Number(newSale.quantity) }
    ]);
    setNewSale({ customer: '', product: '', quantity: '', date: '' });
  };

  const handleDelete = (id) => {
    setSales(sales.filter(sale => sale.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Sales Management</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleAddSale} className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="customer"
              value={newSale.customer}
              onChange={handleChange}
              placeholder="Customer"
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="text"
              name="product"
              value={newSale.product}
              onChange={handleChange}
              placeholder="Product"
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="number"
              name="quantity"
              value={newSale.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              className="border px-3 py-2 rounded-lg flex-1"
              required
              min="1"
            />
            <input
              type="date"
              name="date"
              value={newSale.date}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Customer</th>
              <th className="py-2">Product</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Date</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-t">
                <td className="py-2">{sale.customer}</td>
                <td className="py-2">{sale.product}</td>
                <td className="py-2">{sale.quantity}</td>
                <td className="py-2">{sale.date}</td>
                <td className="py-2">
                  <button
                    onClick={() => handleDelete(sale.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;