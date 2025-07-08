import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = "https://stockmanagementbackend.onrender.com/api/sales/";

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(API_URL, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch sales data");
        const data = await res.json();
        setSales(Array.isArray(data.sales) ? data.sales : data);
      } catch {
        setError("Could not load sales data.");
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const totalRevenue = sales.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
  const totalCost = sales.reduce((sum, item) => sum + (item.cost * item.quantity || 0), 0);
  const netProfit = totalRevenue - totalCost;

  const chartData = {
    labels: ['Revenue', 'Cost', 'Profit'],
    datasets: [
      {
        label: 'Financials',
        data: [totalRevenue, totalCost, netProfit],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(59, 130, 246, 0.7)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'Financial Overview' },
    },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold">${netProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Details</h2>
          {loading ? (
            <div className="text-center text-gray-500 py-4">Loading...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Product</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Cost</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((item) => (
                  <tr key={item._id || item.id} className="border-t">
                    <td className="py-2">{item.productName}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">${item.price.toFixed(2)}</td>
                    <td className="py-2">${item.cost.toFixed(2)}</td>
                    <td className="py-2">{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {sales.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-4">
                      No sales data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Financial Distribution</h2>
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;