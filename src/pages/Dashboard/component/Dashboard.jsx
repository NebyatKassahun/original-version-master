import React, { useState, useEffect } from 'react';
import { 
	Package, 
	DollarSign, 
	AlertTriangle, 
	TrendingUp, 
	ShoppingCart, 
	Truck, 
	Clock,
	Users,
	BarChart3,
	Activity,
	Calendar,
	CheckCircle,
	ArrowUpRight,
	ArrowDownRight,
	RefreshCw,
	Eye,
	Plus,
	Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { getBaseUrl } from "../../../Utils/baseApi";

const API_BASE = getBaseUrl();

const Dashboard = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [stats, setStats] = useState({
		products: { total: 0, lowStock: 0, outOfStock: 0 },
		sales: { total: 0, revenue: 0, todaySales: 0, todayRevenue: 0 },
		purchases: { total: 0, totalSpent: 0 },
		customers: { total: 0, active: 0 },
		growth: { sales: 0, revenue: 0 }
	});
	const [chartData, setChartData] = useState({
		salesTrend: [],
		stockByCategory: [],
		recentSales: [],
		recentPurchases: []
	});
	const [recentActivities, setRecentActivities] = useState([]);
	const [alerts, setAlerts] = useState([]);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("token");
			const headers = token ? { Authorization: `Bearer ${token}` } : {};

			// Fetch all data in parallel
			const [salesRes, productsRes, purchasesRes, customersRes] = await Promise.all([
				fetch(`${API_BASE}/api/sales`, { headers }),
				fetch(`${API_BASE}/api/product`, { headers }),
				fetch(`${API_BASE}/api/purchase`, { headers }),
				fetch(`${API_BASE}/api/customers`, { headers }),
			]);

			const [salesData, productsData, purchasesData, customersData] = await Promise.all([
				salesRes.json(),
				productsRes.json(),
				purchasesRes.json(),
				customersRes.json(),
			]);

			// Process sales data
			const sales = Array.isArray(salesData) ? salesData : 
				Array.isArray(salesData.sales) ? salesData.sales : 
				Array.isArray(salesData.data) ? salesData.data : [];
			
			const totalRevenue = sales.reduce((sum, sale) => {
				const saleRevenue = sale.productSales?.reduce(
					(saleSum, ps) => saleSum + ps.salePrice * ps.saleQuantity, 0
				) || 0;
				return sum + saleRevenue;
			}, 0);

			// Calculate today's sales
			const today = new Date().toDateString();
			const todaySales = sales.filter(sale => {
				const saleDate = new Date(sale.createdAt || sale.date).toDateString();
				return saleDate === today;
			});
			const todayRevenue = todaySales.reduce((sum, sale) => {
				const saleRevenue = sale.productSales?.reduce(
					(saleSum, ps) => saleSum + ps.salePrice * ps.saleQuantity, 0
				) || 0;
				return sum + saleRevenue;
			}, 0);

			// Process products data
			const products = Array.isArray(productsData) ? productsData : 
				Array.isArray(productsData.products) ? productsData.products : 
				Array.isArray(productsData.data) ? productsData.data : [];
			
			const lowStock = products.filter(p => p.quantity <= 10 && p.quantity > 0);
			const outOfStock = products.filter(p => p.quantity === 0);

			// Process purchases data
			const purchases = Array.isArray(purchasesData) ? purchasesData : 
				Array.isArray(purchasesData.purchases) ? purchasesData.purchases : 
				Array.isArray(purchasesData.data) ? purchasesData.data : [];
			
			const totalSpent = purchases.reduce((sum, purchase) => {
				const purchaseTotal = purchase.productPurchases?.reduce(
					(purchaseSum, pp) => purchaseSum + pp.purchaseQuantity * pp.purchasePrice, 0
				) || 0;
				return sum + purchaseTotal;
			}, 0);

			// Process customers data
			const customers = Array.isArray(customersData) ? customersData : 
				Array.isArray(customersData.customers) ? customersData.customers : 
				Array.isArray(customersData.data) ? customersData.data : [];

			// Calculate growth (simplified - you might want to implement proper date-based calculations)
			const salesGrowth = sales.length > 0 ? 12.5 : 0;
			const revenueGrowth = totalRevenue > 0 ? 8.3 : 0;

			setStats({
				products: { 
					total: products.length, 
					lowStock: lowStock.length, 
					outOfStock: outOfStock.length 
				},
				sales: { 
					total: sales.length, 
					revenue: totalRevenue, 
					todaySales: todaySales.length,
					todayRevenue: todayRevenue
				},
				purchases: { total: purchases.length, totalSpent },
				customers: { total: customers.length, active: customers.length },
				growth: { sales: salesGrowth, revenue: revenueGrowth }
			});

			// Generate chart data
			generateChartData(sales, products, purchases);
			generateRecentActivities(sales, purchases, products);
			generateAlerts(products, sales);

		} catch (err) {
			console.error("Error fetching dashboard data:", err);
			setError("Failed to load dashboard data");
		} finally {
			setLoading(false);
		}
	};

	const generateChartData = (sales, products, purchases) => {
		// Sales trend data (last 7 days)
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - i);
			return {
				date: format(date, 'MMM dd'),
				sales: Math.floor(Math.random() * 20) + 5, // Placeholder data
				revenue: Math.floor(Math.random() * 5000) + 1000
			};
		}).reverse();

		// Stock by category
		const categories = {};
		products.forEach(product => {
			const category = product.category?.name || product.category || 'Uncategorized';
			categories[category] = (categories[category] || 0) + product.quantity;
		});

		const stockByCategory = Object.entries(categories).map(([category, stock]) => ({
			category,
			stock
		}));

		// Recent sales (last 5)
		const recentSales = sales.slice(0, 5).map(sale => ({
			id: sale.saleId || sale.id,
			customer: sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Unknown',
			amount: sale.productSales?.reduce((sum, ps) => sum + ps.salePrice * ps.saleQuantity, 0) || 0,
			date: format(new Date(sale.createdAt || sale.date), 'MMM dd')
		}));

		// Recent purchases (last 5)
		const recentPurchases = purchases.slice(0, 5).map(purchase => ({
			id: purchase.purchaseId || purchase.id,
			supplier: purchase.supplierId, // You might want to fetch supplier names
			amount: purchase.productPurchases?.reduce((sum, pp) => sum + pp.purchaseQuantity * pp.purchasePrice, 0) || 0,
			date: format(new Date(purchase.createdAt || purchase.date), 'MMM dd')
		}));

		setChartData({
			salesTrend: last7Days,
			stockByCategory,
			recentSales,
			recentPurchases
		});
	};

	const generateRecentActivities = (sales, purchases, products) => {
		const activities = [];

		// Add recent sales
		sales.slice(0, 3).forEach(sale => {
			activities.push({
				id: `sale-${sale.saleId || sale.id}`,
				type: 'sale',
				message: `Sale #${sale.saleId || sale.id} completed`,
				time: format(new Date(sale.createdAt || sale.date), 'MMM dd, HH:mm'),
    icon: ShoppingCart,
				color: 'blue',
				amount: sale.productSales?.reduce((sum, ps) => sum + ps.salePrice * ps.saleQuantity, 0) || 0
			});
		});

		// Add recent purchases
		purchases.slice(0, 2).forEach(purchase => {
			activities.push({
				id: `purchase-${purchase.purchaseId || purchase.id}`,
				type: 'purchase',
				message: `Purchase #${purchase.purchaseId || purchase.id} received`,
				time: format(new Date(purchase.createdAt || purchase.date), 'MMM dd, HH:mm'),
				icon: Truck,
				color: 'green',
				amount: purchase.productPurchases?.reduce((sum, pp) => sum + pp.purchaseQuantity * pp.purchasePrice, 0) || 0
			});
		});

		// Add low stock alerts
		const lowStockProducts = products.filter(p => p.quantity <= 10 && p.quantity > 0);
		lowStockProducts.slice(0, 2).forEach(product => {
			activities.push({
				id: `stock-${product.productId}`,
    type: 'stock',
				message: `Low stock: ${product.name} (${product.quantity} left)`,
				time: 'Just now',
				icon: AlertTriangle,
    color: 'orange'
			});
		});

		// Sort by time (most recent first)
		activities.sort((a, b) => new Date(b.time) - new Date(a.time));
		setRecentActivities(activities.slice(0, 8));
	};

	const generateAlerts = (products, sales) => {
		const alerts = [];

		// Low stock alerts
		const lowStockProducts = products.filter(p => p.quantity <= 10 && p.quantity > 0);
		lowStockProducts.slice(0, 3).forEach(product => {
			alerts.push({
				id: `low-stock-${product.productId}`,
				type: 'low-stock',
				title: `Low Stock Alert`,
				message: `${product.name} - Only ${product.quantity} items remaining`,
				severity: 'warning',
				icon: AlertTriangle
			});
		});

		// Out of stock alerts
		const outOfStockProducts = products.filter(p => p.quantity === 0);
		outOfStockProducts.slice(0, 2).forEach(product => {
			alerts.push({
				id: `out-of-stock-${product.productId}`,
				type: 'out-of-stock',
				title: `Out of Stock`,
				message: `${product.name} is completely out of stock`,
				severity: 'error',
				icon: Package
			});
		});

		// Sales performance alerts
		if (sales.length === 0) {
			alerts.push({
				id: 'no-sales',
				type: 'performance',
				title: `No Sales Today`,
				message: 'No sales recorded today. Consider promotional activities.',
				severity: 'info',
				icon: TrendingUp // Changed from TrendingDown to TrendingUp
			});
		}

		setAlerts(alerts.slice(0, 5));
	};

	const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue", onClick }) => (
		<div 
			className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
			onClick={onClick}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
					<p className="text-3xl font-bold text-gray-900">{value}</p>
					{trend && (
						<div className="flex items-center mt-2">
							{trend > 0 ? (
								<ArrowUpRight className="w-4 h-4 text-green-600" />
							) : (
								<ArrowDownRight className="w-4 h-4 text-red-600" />
							)}
							<span className={`text-sm ml-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
								{Math.abs(trend)}%
							</span>
						</div>
					)}
					{subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
				</div>
				<div className={`p-3 rounded-2xl bg-${color}-100 text-${color}-600`}>
					<Icon className="w-8 h-8" />
				</div>
			</div>
		</div>
	);

	const ActivityItem = ({ activity }) => {
		const ActivityIcon = activity.icon;
		const colorClasses = {
			blue: 'bg-blue-100 text-blue-600',
			orange: 'bg-orange-100 text-orange-600',
			green: 'bg-green-100 text-green-600',
			purple: 'bg-purple-100 text-purple-600'
		};

		return (
			<div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
				<div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[activity.color]}`}>
					<ActivityIcon className="w-5 h-5" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-gray-900">{activity.message}</p>
					<div className="flex items-center justify-between mt-1">
						<p className="text-xs text-gray-500">{activity.time}</p>
						{activity.amount && (
							<p className="text-xs font-medium text-green-600">
								{activity.amount.toLocaleString()} ETB
							</p>
						)}
					</div>
				</div>
			</div>
		);
	};

	const AlertItem = ({ alert }) => {
		const AlertIcon = alert.icon;
		const severityClasses = {
			error: 'bg-red-50 border-red-200 text-red-800',
			warning: 'bg-orange-50 border-orange-200 text-orange-800',
			info: 'bg-blue-50 border-blue-200 text-blue-800'
		};

		return (
			<div className={`border rounded-xl p-4 hover:bg-opacity-75 transition-colors duration-200 ${severityClasses[alert.severity]}`}>
				<div className="flex items-center">
					<AlertIcon className="w-5 h-5 mr-3" />
					<div>
						<h4 className="text-sm font-semibold">{alert.title}</h4>
						<p className="text-xs mt-1">{alert.message}</p>
					</div>
				</div>
			</div>
		);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

  return (
    <div className="space-y-8 min-h-full p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
					<p className="text-gray-600 mt-1">
						Welcome back! Here's what's happening with your business today.
					</p>
        </div>
				<div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
        </div>
					<button
						onClick={fetchDashboardData}
						className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2"
					>
						<RefreshCw className="w-4 h-4" />
						<span>Refresh</span>
					</button>
          </div>
        </div>

			{/* Error Message */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					{error}
            </div>
			)}

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					title="Total Products"
					value={stats.products.total}
					subtitle={`${stats.products.lowStock} low stock, ${stats.products.outOfStock} out of stock`}
					icon={Package}
					trend={stats.growth.sales}
					color="blue"
				/>
				<StatCard
					title="Sales Today"
					value={stats.sales.todaySales}
					subtitle={`${stats.sales.todayRevenue.toLocaleString()} ETB revenue`}
					icon={DollarSign}
					trend={stats.growth.revenue}
					color="green"
				/>
				<StatCard
					title="Total Alerts"
					value={alerts.length}
					subtitle={`${stats.products.lowStock} low stock items`}
					icon={AlertTriangle}
					color="orange"
				/>
				<StatCard
					title="Active Customers"
					value={stats.customers.active}
					subtitle={`${stats.customers.total} total customers`}
					icon={Users}
					color="purple"
				/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Overview Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Sales Overview</h3>
            <div className="flex items-center space-x-2">
							<Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
						<LineChart data={chartData.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
								dataKey="date"
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
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
						<Activity className="w-5 h-5 text-purple-600" />
                  </div>
					<div className="space-y-4 max-h-80 overflow-y-auto">
						{recentActivities.length > 0 ? (
							recentActivities.map((activity) => (
								<ActivityItem key={activity.id} activity={activity} />
							))
						) : (
							<div className="text-center py-8 text-gray-500">
								<Activity className="w-8 h-8 mx-auto mb-2" />
								<p className="text-sm">No recent activity</p>
                  </div>
						)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock by Category */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-xl font-semibold text-gray-900">Stock by Category</h3>
						<BarChart3 className="w-5 h-5 text-green-600" />
					</div>
					{chartData.stockByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
							<BarChart data={chartData.stockByCategory}>
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
								<Bar dataKey="stock" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
					) : (
						<div className="text-center py-8 text-gray-500">
							<Package className="w-8 h-8 mx-auto mb-2" />
							<p className="text-sm">No stock data available</p>
						</div>
					)}
        </div>

				{/* Alerts */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-xl font-semibold text-gray-900">Alerts</h3>
						<AlertTriangle className="w-5 h-5 text-red-600" />
					</div>
          <div className="space-y-4">
						{alerts.length > 0 ? (
							alerts.map((alert) => (
								<AlertItem key={alert.id} alert={alert} />
							))
						) : (
							<div className="text-center py-8 text-gray-500">
								<CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
								<p className="text-sm">All systems operational</p>
								<p className="text-xs text-gray-400">No alerts at this time</p>
							</div>
						)}
                </div>
              </div>
            </div>

			{/* Quick Actions */}
			<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
				<h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<button className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
						<Plus className="w-6 h-6 text-blue-600 mb-2" />
						<span className="text-sm font-medium text-gray-900">Add Product</span>
					</button>
					<button className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200">
						<ShoppingCart className="w-6 h-6 text-green-600 mb-2" />
						<span className="text-sm font-medium text-gray-900">New Sale</span>
					</button>
					<button className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200">
						<Truck className="w-6 h-6 text-yellow-600 mb-2" />
						<span className="text-sm font-medium text-gray-900">New Purchase</span>
					</button>
					<button className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200">
						<Users className="w-6 h-6 text-purple-600 mb-2" />
						<span className="text-sm font-medium text-gray-900">Add Customer</span>
					</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;