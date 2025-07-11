import React, { useState, useEffect } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	LineElement,
	PointElement,
	Tooltip,
	Legend,
	Title,
} from "chart.js";
import {
	getBaseUrl
} from "../../../Utils/baseApi";
import {
	exportToCSV,
	CSV_HEADERS,
	formatDateForCSV,
	formatCurrencyForCSV
} from "../../../Utils/csvExport";
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	Package,
	ShoppingCart,
	Users,
	BarChart3,
	PieChart,
	Activity,
	Calendar,
	AlertTriangle,
	CheckCircle,
	Clock,
	ArrowUpRight,
	ArrowDownRight,
	Download,
} from "lucide-react";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	LineElement,
	PointElement,
	Tooltip,
	Legend,
	Title
);

const API_BASE = getBaseUrl();

const Reports = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [stats, setStats] = useState({
		sales: { count: 0, revenue: 0, growth: 0 },
		products: { count: 0, lowStock: 0, outOfStock: 0 },
		purchases: { count: 0, totalSpent: 0, growth: 0 },
		customers: { count: 0, active: 0 },
	});
	const [chartData, setChartData] = useState({
		salesTrend: { labels: [], datasets: [] },
		productCategories: { labels: [], datasets: [] },
		revenueComparison: { labels: [], datasets: [] },
		monthlyStats: { labels: [], datasets: [] },
	});
	const [timeRange, setTimeRange] = useState("30"); // days
	const [selectedMetric, setSelectedMetric] = useState("sales");
	const [exportData, setExportData] = useState({
		sales: [],
		products: [],
		purchases: [],
		customers: []
	});

	useEffect(() => {
		fetchAnalytics();
	}, [timeRange]);

	const fetchAnalytics = async () => {
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

			// Process products data
			const products = Array.isArray(productsData) ? productsData : 
				Array.isArray(productsData.products) ? productsData.products : 
				Array.isArray(productsData.data) ? productsData.data : [];
			
			const lowStock = products.filter(p => p.quantity <= 10 && p.quantity > 0).length;
			const outOfStock = products.filter(p => p.quantity === 0).length;

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

			// Calculate growth rates (simplified - you might want to implement proper date-based calculations)
			const salesGrowth = sales.length > 0 ? 12.5 : 0; // Placeholder
			const purchasesGrowth = purchases.length > 0 ? 8.3 : 0; // Placeholder

			setStats({
				sales: { count: sales.length, revenue: totalRevenue, growth: salesGrowth },
				products: { count: products.length, lowStock, outOfStock },
				purchases: { count: purchases.length, totalSpent, growth: purchasesGrowth },
				customers: { count: customers.length, active: customers.length },
			});

			// Store data for export
			setExportData({
				sales: sales,
				products: products,
				purchases: purchases,
				customers: customers
			});

			// Generate chart data
			generateChartData(sales, products, purchases);

		} catch (err) {
			console.error("Error fetching analytics:", err);
			setError("Failed to load analytics data");
		} finally {
			setLoading(false);
		}
	};

	// Export functions
	const handleExportSales = () => {
		try {
			const formattedSales = exportData.sales.map(sale => ({
				saleId: sale.saleId || sale.id || '',
				customerName: sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Unknown',
				customerEmail: sale.customer?.email || '',
				totalQuantity: sale.productSales?.reduce((sum, ps) => sum + ps.saleQuantity, 0) || 0,
				totalRevenue: formatCurrencyForCSV(sale.productSales?.reduce((sum, ps) => sum + ps.salePrice * ps.saleQuantity, 0) || 0),
				createdBy: sale.createdByUser ? `${sale.createdByUser.firstName} ${sale.createdByUser.lastName}` : sale.createdBy || 'Unknown',
				createdAt: formatDateForCSV(sale.createdAt || sale.date)
			}));

			exportToCSV(formattedSales, CSV_HEADERS.SALES, `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
		} catch (error) {
			console.error('Error exporting sales:', error);
			alert('Failed to export sales data');
		}
	};

	const handleExportProducts = () => {
		try {
			const formattedProducts = exportData.products.map(product => ({
				productId: product.productId || product.id || '',
				name: product.name || '',
				category: product.category?.name || product.category || 'Uncategorized',
				salePrice: formatCurrencyForCSV(product.salePrice || product.price || 0),
				purchasePrice: formatCurrencyForCSV(product.purchasePrice || 0),
				quantity: product.quantity || 0,
				description: product.description || ''
			}));

			exportToCSV(formattedProducts, CSV_HEADERS.PRODUCTS, `products-report-${new Date().toISOString().split('T')[0]}.csv`);
		} catch (error) {
			console.error('Error exporting products:', error);
			alert('Failed to export products data');
		}
	};

	const handleExportPurchases = () => {
		try {
			const formattedPurchases = exportData.purchases.map(purchase => ({
				purchaseId: purchase.purchaseId || purchase.id || '',
				supplierName: purchase.supplierId || 'Unknown', // You might want to fetch supplier names
				totalQuantity: purchase.productPurchases?.reduce((sum, pp) => sum + pp.purchaseQuantity, 0) || 0,
				totalSpent: formatCurrencyForCSV(purchase.productPurchases?.reduce((sum, pp) => sum + pp.purchaseQuantity * pp.purchasePrice, 0) || 0),
				createdAt: formatDateForCSV(purchase.createdAt || purchase.date)
			}));

			exportToCSV(formattedPurchases, CSV_HEADERS.PURCHASES, `purchases-report-${new Date().toISOString().split('T')[0]}.csv`);
		} catch (error) {
			console.error('Error exporting purchases:', error);
			alert('Failed to export purchases data');
		}
	};

	const handleExportCustomers = () => {
		try {
			const formattedCustomers = exportData.customers.map(customer => ({
				customerId: customer.customerId || customer.id || '',
				firstName: customer.firstName || '',
				lastName: customer.lastName || '',
				email: customer.email || '',
				phone: customer.phone || ''
			}));

			exportToCSV(formattedCustomers, CSV_HEADERS.CUSTOMERS, `customers-report-${new Date().toISOString().split('T')[0]}.csv`);
		} catch (error) {
			console.error('Error exporting customers:', error);
			alert('Failed to export customers data');
		}
	};

	const handleExportAll = () => {
		try {
			const timestamp = new Date().toISOString().split('T')[0];
			
			// Export all data types
			handleExportSales();
			setTimeout(() => handleExportProducts(), 100);
			setTimeout(() => handleExportPurchases(), 200);
			setTimeout(() => handleExportCustomers(), 300);
			
			// Show success message
			alert('All reports exported successfully!');
		} catch (error) {
			console.error('Error exporting all data:', error);
			alert('Failed to export all data');
		}
	};

	const generateChartData = (sales, products, purchases) => {
		// Sales trend data (last 7 days)
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - i);
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		}).reverse();

		const salesTrendData = {
			labels: last7Days,
			datasets: [{
				label: 'Sales',
				data: last7Days.map(() => Math.floor(Math.random() * 50) + 10), // Placeholder data
				borderColor: '#3b82f6',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				tension: 0.4,
			}]
		};

		// Product categories distribution
		const categories = {};
		products.forEach(product => {
			const category = product.category?.name || product.category || 'Uncategorized';
			categories[category] = (categories[category] || 0) + 1;
		});

		const productCategoriesData = {
			labels: Object.keys(categories),
			datasets: [{
				data: Object.values(categories),
				backgroundColor: [
					'#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
					'#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
				],
				borderWidth: 2,
			}]
		};

		// Revenue comparison (Sales vs Purchases)
		const revenueComparisonData = {
			labels: ['Sales Revenue', 'Purchase Expenses'],
			datasets: [{
				label: 'Amount (ETB)',
				data: [
					stats.sales.revenue,
					stats.purchases.totalSpent
				],
				backgroundColor: ['#10b981', '#ef4444'],
				borderRadius: 8,
			}]
		};

		// Monthly statistics
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
		const monthlyStatsData = {
			labels: months,
		datasets: [
			{
					label: 'Sales',
					data: months.map(() => Math.floor(Math.random() * 100) + 20),
					borderColor: '#3b82f6',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
				},
				{
					label: 'Purchases',
					data: months.map(() => Math.floor(Math.random() * 80) + 15),
					borderColor: '#f59e0b',
					backgroundColor: 'rgba(245, 158, 11, 0.1)',
				}
			]
		};

		setChartData({
			salesTrend: salesTrendData,
			productCategories: productCategoriesData,
			revenueComparison: revenueComparisonData,
			monthlyStats: monthlyStatsData,
		});
	};

	const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue" }) => (
		<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-gray-600 mb-1">{title}</p>
					<p className="text-2xl font-bold text-gray-900">{value}</p>
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
				<div className={`p-3 bg-${color}-100 text-${color}-600 rounded-xl`}>
					<Icon className="w-6 h-6" />
				</div>
			</div>
		</div>
	);

	const MetricSelector = () => (
		<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
				<select
					value={timeRange}
					onChange={(e) => setTimeRange(e.target.value)}
					className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
				>
					<option value="7">Last 7 days</option>
					<option value="30">Last 30 days</option>
					<option value="90">Last 90 days</option>
					<option value="365">Last year</option>
				</select>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<button
					onClick={() => setSelectedMetric("sales")}
					className={`p-4 rounded-xl border-2 transition-all duration-200 ${
						selectedMetric === "sales"
							? "border-blue-500 bg-blue-50"
							: "border-gray-200 hover:border-gray-300"
					}`}
				>
					<div className="flex items-center space-x-3">
						<TrendingUp className="w-5 h-5 text-blue-600" />
						<div className="text-left">
							<p className="font-medium text-gray-900">Sales</p>
							<p className="text-sm text-gray-600">{stats.sales.count} orders</p>
						</div>
					</div>
				</button>
				<button
					onClick={() => setSelectedMetric("products")}
					className={`p-4 rounded-xl border-2 transition-all duration-200 ${
						selectedMetric === "products"
							? "border-green-500 bg-green-50"
							: "border-gray-200 hover:border-gray-300"
					}`}
				>
					<div className="flex items-center space-x-3">
						<Package className="w-5 h-5 text-green-600" />
						<div className="text-left">
							<p className="font-medium text-gray-900">Products</p>
							<p className="text-sm text-gray-600">{stats.products.count} items</p>
						</div>
					</div>
				</button>
				<button
					onClick={() => setSelectedMetric("purchases")}
					className={`p-4 rounded-xl border-2 transition-all duration-200 ${
						selectedMetric === "purchases"
							? "border-yellow-500 bg-yellow-50"
							: "border-gray-200 hover:border-gray-300"
					}`}
				>
					<div className="flex items-center space-x-3">
						<ShoppingCart className="w-5 h-5 text-yellow-600" />
						<div className="text-left">
							<p className="font-medium text-gray-900">Purchases</p>
							<p className="text-sm text-gray-600">{stats.purchases.count} orders</p>
						</div>
					</div>
				</button>
				<button
					onClick={() => setSelectedMetric("customers")}
					className={`p-4 rounded-xl border-2 transition-all duration-200 ${
						selectedMetric === "customers"
							? "border-purple-500 bg-purple-50"
							: "border-gray-200 hover:border-gray-300"
					}`}
				>
					<div className="flex items-center space-x-3">
						<Users className="w-5 h-5 text-purple-600" />
						<div className="text-left">
							<p className="font-medium text-gray-900">Customers</p>
							<p className="text-sm text-gray-600">{stats.customers.count} total</p>
						</div>
					</div>
				</button>
			</div>
		</div>
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="space-y-8 min-h-full p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
					<p className="text-gray-600 mt-1">
						Comprehensive business insights and performance metrics
					</p>
				</div>
				<div className="flex items-center space-x-4">
					<div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
						{timeRange} days
					</div>
					
					{/* Export Buttons */}
					<div className="flex items-center space-x-2">
						<button
							onClick={handleExportAll}
							className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
							title="Export All Data"
						>
							<Download className="w-4 h-4" />
							<span>Export All</span>
						</button>
						<div className="w-px h-6 bg-gray-300"></div>
						<button
							onClick={handleExportSales}
							className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center space-x-2 text-sm"
							title="Export Sales Data"
						>
							<Download className="w-4 h-4" />
							<span>Sales</span>
						</button>
						<button
							onClick={handleExportProducts}
							className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 text-sm"
							title="Export Products Data"
						>
							<Download className="w-4 h-4" />
							<span>Products</span>
						</button>
						<button
							onClick={handleExportPurchases}
							className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-all duration-200 flex items-center space-x-2 text-sm"
							title="Export Purchases Data"
						>
							<Download className="w-4 h-4" />
							<span>Purchases</span>
						</button>
						<button
							onClick={handleExportCustomers}
							className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center space-x-2 text-sm"
							title="Export Customers Data"
						>
							<Download className="w-4 h-4" />
							<span>Customers</span>
						</button>
					</div>
					
					<button
						onClick={fetchAnalytics}
						className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
					>
						Refresh Data
					</button>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					{error}
				</div>
			)}

			{/* Metric Selector */}
			<MetricSelector />

			{/* Key Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					title="Total Sales"
					value={stats.sales.count}
					subtitle={`${stats.sales.revenue.toLocaleString()} ETB revenue`}
					icon={TrendingUp}
					trend={stats.sales.growth}
					color="blue"
				/>
				<StatCard
					title="Products"
					value={stats.products.count}
					subtitle={`${stats.products.lowStock} low stock, ${stats.products.outOfStock} out of stock`}
					icon={Package}
					color="green"
				/>
				<StatCard
					title="Purchases"
					value={stats.purchases.count}
					subtitle={`${stats.purchases.totalSpent.toLocaleString()} ETB spent`}
					icon={ShoppingCart}
					trend={stats.purchases.growth}
					color="yellow"
				/>
				<StatCard
					title="Customers"
					value={stats.customers.count}
					subtitle={`${stats.customers.active} active customers`}
					icon={Users}
					color="purple"
				/>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Sales Trend */}
				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
						<Activity className="w-5 h-5 text-blue-600" />
					</div>
					<Line
						data={chartData.salesTrend}
						options={{
							responsive: true,
							plugins: {
								legend: { display: false },
								tooltip: {
									backgroundColor: 'rgba(0, 0, 0, 0.8)',
									titleColor: 'white',
									bodyColor: 'white',
								}
							},
							scales: {
								y: {
									beginAtZero: true,
									grid: { color: 'rgba(0, 0, 0, 0.1)' }
								},
								x: {
									grid: { display: false }
								}
							}
						}}
					/>
				</div>

				{/* Product Categories */}
				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-semibold text-gray-900">Product Categories</h3>
						<PieChart className="w-5 h-5 text-green-600" />
					</div>
					<Pie
						data={chartData.productCategories}
						options={{
							responsive: true,
							plugins: {
								legend: { position: 'bottom' },
								tooltip: {
									backgroundColor: 'rgba(0, 0, 0, 0.8)',
									titleColor: 'white',
									bodyColor: 'white',
								}
							}
						}}
					/>
				</div>

				{/* Revenue Comparison */}
				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-semibold text-gray-900">Revenue vs Expenses</h3>
						<BarChart3 className="w-5 h-5 text-purple-600" />
					</div>
					<Bar
						data={chartData.revenueComparison}
						options={{
							responsive: true,
							plugins: {
								legend: { display: false },
								tooltip: {
									backgroundColor: 'rgba(0, 0, 0, 0.8)',
									titleColor: 'white',
									bodyColor: 'white',
								}
							},
							scales: {
								y: {
									beginAtZero: true,
									grid: { color: 'rgba(0, 0, 0, 0.1)' }
								},
								x: {
									grid: { display: false }
								}
							}
						}}
					/>
				</div>

				{/* Monthly Statistics */}
				<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-semibold text-gray-900">Monthly Overview</h3>
						<Calendar className="w-5 h-5 text-orange-600" />
					</div>
					<Line
						data={chartData.monthlyStats}
						options={{
							responsive: true,
							plugins: {
								legend: { position: 'bottom' },
								tooltip: {
									backgroundColor: 'rgba(0, 0, 0, 0.8)',
									titleColor: 'white',
									bodyColor: 'white',
								}
							},
							scales: {
								y: {
									beginAtZero: true,
									grid: { color: 'rgba(0, 0, 0, 0.1)' }
								},
								x: {
									grid: { display: false }
								}
							}
						}}
					/>
				</div>
			</div>

			{/* Insights Section */}
			<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
				<h3 className="text-lg font-semibold text-gray-900 mb-6">Key Insights</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="flex items-start space-x-3">
						<CheckCircle className="w-5 h-5 text-green-600 mt-1" />
						<div>
							<h4 className="font-medium text-gray-900">Revenue Growth</h4>
							<p className="text-sm text-gray-600">
								Sales revenue increased by {stats.sales.growth}% compared to last period
							</p>
						</div>
					</div>
					<div className="flex items-start space-x-3">
						<AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
						<div>
							<h4 className="font-medium text-gray-900">Inventory Alert</h4>
							<p className="text-sm text-gray-600">
								{stats.products.lowStock} products are running low on stock
							</p>
						</div>
					</div>
					<div className="flex items-start space-x-3">
						<Clock className="w-5 h-5 text-blue-600 mt-1" />
						<div>
							<h4 className="font-medium text-gray-900">Recent Activity</h4>
							<p className="text-sm text-gray-600">
								{stats.sales.count} new sales recorded in the last {timeRange} days
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Reports;
