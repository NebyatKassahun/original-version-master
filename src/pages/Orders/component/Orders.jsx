import React, { useState } from 'react';

const initialOrders = [
  { id: 1, customer: 'John Doe', product: 'Notebook', quantity: 2, date: '2024-06-01', status: 'Pending' },
  { id: 2, customer: 'Jane Smith', product: 'Pen', quantity: 5, date: '2024-06-05', status: 'Shipped' }
];

const Orders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    product: '',
    quantity: '',
    date: '',
    status: 'Pending'
  });

  const handleChange = (e) => {
    setNewOrder({ ...newOrder, [e.target.name]: e.target.value });
  };

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (!newOrder.customer || !newOrder.product || !newOrder.quantity || !newOrder.date) return;
    setOrders([
      ...orders,
      { ...newOrder, id: Date.now(), quantity: Number(newOrder.quantity) }
    ]);
    setNewOrder({ customer: '', product: '', quantity: '', date: '', status: 'Pending' });
  };

  const handleDelete = (id) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  const handleStatusChange = (id, status) => {
    setOrders(orders.map(order =>
      order.id === id ? { ...order, status } : order
    ));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Orders Management</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleAddOrder} className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="customer"
              value={newOrder.customer}
              onChange={handleChange}
              placeholder="Customer"
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="text"
              name="product"
              value={newOrder.product}
              onChange={handleChange}
              placeholder="Product"
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="number"
              name="quantity"
              value={newOrder.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              className="border px-3 py-2 rounded-lg flex-1"
              required
              min="1"
            />
            <input
              type="date"
              name="date"
              value={newOrder.date}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <select
              name="status"
              value={newOrder.status}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg flex-1"
            >
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
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
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="py-2">{order.customer}</td>
                <td className="py-2">{order.product}</td>
                <td className="py-2">{order.quantity}</td>
                <td className="py-2">{order.date}</td>
                <td className="py-2">
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td className="py-2">
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-4">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;