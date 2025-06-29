import React, { useState } from 'react';

const initialPurchases = [
  { id: 1, supplier: 'ABC Supplies', product: 'Paper', quantity: 100, date: '2024-06-01' },
  { id: 2, supplier: 'XYZ Traders', product: 'Ink', quantity: 50, date: '2024-06-05' }
];

const Purchase = () => {
  const [purchases, setPurchases] = useState(initialPurchases);
  const [newPurchase, setNewPurchase] = useState({
    supplier: '',
    product: '',
    quantity: '',
    date: ''
  });

  const handleChange = (e) => {
    setNewPurchase({ ...newPurchase, [e.target.name]: e.target.value });
  };

  const handleAddPurchase = (e) => {
    e.preventDefault();
    if (!newPurchase.supplier || !newPurchase.product || !newPurchase.quantity || !newPurchase.date) return;
    setPurchases([
      ...purchases,
      { ...newPurchase, id: Date.now(), quantity: Number(newPurchase.quantity) }
    ]);
    setNewPurchase({ supplier: '', product: '', quantity: '', date: '' });
  };

  const handleDelete = (id) => {
    setPurchases(purchases.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Purchase Management</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleAddPurchase} className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="supplier"
              value={newPurchase.supplier}
              onChange={handleChange}
              placeholder="Supplier"
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="text"
              name="product"
              value={newPurchase.product}
              onChange={handleChange}
              placeholder="Product"
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="number"
              name="quantity"
              value={newPurchase.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              className="border px-3 py-2 rounded-lg flex-1"
              required
              min="1"
            />
            <input
              type="date"
              name="date"
              value={newPurchase.date}
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
              <th className="py-2">Supplier</th>
              <th className="py-2">Product</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Date</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-t">
                <td className="py-2">{purchase.supplier}</td>
                <td className="py-2">{purchase.product}</td>
                <td className="py-2">{purchase.quantity}</td>
                <td className="py-2">{purchase.date}</td>
                <td className="py-2">
                  <button
                    onClick={() => handleDelete(purchase.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchase;