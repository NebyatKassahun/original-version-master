import React, { useState } from 'react';

const Customers = () => {
  const [customers, setCustomers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-1234' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678' }
  ]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  const handleChange = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) return;
    setCustomers([
      ...customers,
      { ...newCustomer, id: Date.now() }
    ]);
    setNewCustomer({ name: '', email: '', phone: '' });
  };

  const handleDelete = (id) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Customer Management</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleAddCustomer} className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="name"
              value={newCustomer.name}
              onChange={handleChange}
              placeholder="Name"
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="email"
              name="email"
              value={newCustomer.email}
              onChange={handleChange}
              placeholder="Email"
              className="border px-3 py-2 rounded-lg flex-1"
              required
            />
            <input
              type="text"
              name="phone"
              value={newCustomer.phone}
              onChange={handleChange}
              placeholder="Phone"
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
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t">
                <td className="py-2">{customer.name}</td>
                <td className="py-2">{customer.email}</td>
                <td className="py-2">{customer.phone}</td>
                <td className="py-2">
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-4">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;