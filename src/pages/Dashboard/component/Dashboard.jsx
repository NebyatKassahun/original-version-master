import React from 'react';
import { Package, DollarSign, AlertTriangle, TrendingUp, ShoppingCart, Truck, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

const salesData = [
  { month: 'Jan', sales: 350 },
  { month: 'Feb', sales: 420 },
  { month: 'Mar', sales: 380 },
  { month: 'Apr', sales: 550 },
  { month: 'May', sales: 650 },
  { month: 'Jun', sales: 720 },
];

const stockData = [
  { category: 'Electronics', stock: 200 },
  { category: 'Clothing', stock: 350 },
  { category: 'Home', stock: 250 },
];

const recentActivities = [
  {
    id: 1,
    type: 'order',
    message: 'Order #1234 was placed',
    time: '20 minutes ago',
    icon: ShoppingCart,
    color: 'blue'
  },
  {
    id: 2,
    type: 'stock',
    message: 'Stock Adjusted Product A',
    time: '1 hour ago',
    icon: Package,
    color: 'orange'
  },
  {
    id: 3,
    type: 'shipment',
    message: 'Order #1233 was shipped',
    time: '8 hour ago',
    icon: Truck,
    color: 'green'
  },
  {
    id: 4,
    type: 'product',
    message: 'New product added: Prd B',
    time: '5 hour ago',
    icon: Package,
    color: 'purple'
  },
  {
    id: 5,
    type: 'order',
    message: 'Order #1232 was placed',
    time: '1 day ago',
    icon: ShoppingCart,
    color: 'blue'
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Product</p>
              <p className="text-3xl font-bold text-gray-900">1,234</p>
              <p className="text-xs text-green-600 mt-1">↗ +12% from last month</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
              <Package className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Sales Today</p>
              <p className="text-3xl font-bold text-gray-900">$12,345</p>
              <p className="text-xs text-green-600 mt-1">↗ +8% from yesterday</p>
            </div>
            <div className="p-3 rounded-2xl bg-green-100 text-green-600">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Alert</p>
              <p className="text-3xl font-bold text-gray-900">5</p>
              <p className="text-xs text-red-600 mt-1">3 low stock items</p>
            </div>
            <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Growth</p>
              <p className="text-3xl font-bold text-gray-900">+23%</p>
              <p className="text-xs text-green-600 mt-1">↗ Revenue growth</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-600">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Overview Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Sales Overview</h3>
            <div className="flex items-center space-x-2">
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 6 months</option>
                <option>Last year</option>
                <option>All time</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const ActivityIcon = activity.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                orange: 'bg-orange-100 text-orange-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600'
              };

              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[activity.color]}`}>
                    <ActivityIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock by Category */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="category"
                stroke="#6b7280"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="stock" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Alert</h3>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors duration-200">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">Low Stock For Product C</h4>
                  <p className="text-xs text-red-600 mt-1">Only 5 items remaining in stock</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 hover:bg-orange-100 transition-colors duration-200">
              <div className="flex items-center">
                <Package className="w-6 h-6 text-orange-600 mr-3" />
                <div>
                  <h4 className="text-sm font-semibold text-orange-800">Reorder Point</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;