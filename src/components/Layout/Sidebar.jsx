import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
	LayoutDashboard,
	Package,
	ShoppingCart,
	TrendingUp,
	Users,
	BarChart3,
	Settings,
	LogOut,
	Menu,
	Layers,
	Tag,
	Truck,
} from "lucide-react";
import { useApp } from "../../Context/AppContext";
import { useAuth } from "../../hooks/useAuth";
import { getBaseUrl, normalizeImageUrl } from "../../Utils/baseApi";
// import { useEffect } from "react";

function joinUrl(base, path) {
	if (!path) return '';
	if (path.startsWith('http')) return path;
	return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}

function cleanProfilePictureUrl(url) {
	if (!url) return '';
	return url.replace('/images/images/', '/images/');
}

const menuItems = [
	{
		icon: LayoutDashboard,
		label: "Dashboard",
		path: "/dashboard",
	},
	{
		icon: Package,
		label: "Products",
		path: "/products",
	},
	{
		icon: Tag,
		label: "Category",
		path: "/category",
	},
	{
		icon: ShoppingCart,
		label: "Purchase",
		path: "/purchase",
	},
	{
		icon: TrendingUp,
		label: "Sales",
		path: "/sales",
	},
	{
		icon: Users,
		label: "Customers",
		path: "/customers",
	},
	{
		icon: Truck,
		label: "Suppliers",
		path: "/suppliers",
	},
	{
		icon: BarChart3,
		label: "Reports",
		path: "/reports",
	},
	{
		icon: Settings,
		label: "Setting",
		path: "/settings",
	},
];

const Sidebar = () => {
	const { state, dispatch } = useApp();
	const { logout, user } = useAuth();
	const location = useLocation();

	const toggleSidebar = () => {
		dispatch({ type: "TOGGLE_SIDEBAR" });
	};

	// useEffect(() => {
	// 	if (!state.sidebarCollapsed) {
	// 		document.body.style.overflow = "hidden";
	// 	} else {
	// 		document.body.style.overflow = "auto";
	// 	}

	// 	// Cleanup in case component unmounts
	// 	return () => {
	// 		document.body.style.overflow = "auto";
	// 	};
	// }, [state.sidebarCollapsed]);

	const handleLogout = () => {
		logout();
	};

	const isActive = (item) => location.pathname === item.path;

	return (
		<div
			className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 z-50 shadow-2xl ${
				state.sidebarCollapsed ? "w-16" : "w-64"
			}`}
		>
			{/* Logo and Toggle */}
			<div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
				{!state.sidebarCollapsed && (
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
							<Layers className="w-5 h-5 text-white" />
						</div>
						<span className="text-xl font-bold text-white tracking-tight">
							Storify
						</span>
					</div>
				)}
				<button
					onClick={toggleSidebar}
					className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
				>
					<Menu className="w-5 h-5" />
				</button>
			</div>

			{/* Navigation */}
			<nav
				className={`mt-6 px-3 flex-1 ${
					state.sidebarCollapsed ? "overflow-y-visible" : "overflow-y-auto"
				}`}
			>
				<ul className="space-y-1">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const active = isActive(item);

						return (
							<li key={item.path}>
								<div className="relative">
									<NavLink
										to={item.path}
										className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative mb-1 ${
											active
												? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-[1.02]"
												: "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-[1.01]"
										}`}
									>
										<Icon
											className={`w-5 h-5 ${
												state.sidebarCollapsed ? "mx-auto" : "mr-3"
											} transition-transform duration-200 ${
												active ? "scale-110" : ""
											}`}
										/>

										{!state.sidebarCollapsed && (
											<span className="font-medium text-sm">{item.label}</span>
										)}

										{/* Tooltip for collapsed state */}
										{state.sidebarCollapsed && (
											<div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-slate-600">
												{item.label}
												<div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-slate-800"></div>
											</div>
										)}
									</NavLink>
								</div>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* User Section */}
			<div className="border-t border-slate-700/50 p-4">
				{/* User Info */}
				{!state.sidebarCollapsed && user && (
					<div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-slate-700/30">
						{user?.profilePictureUrl ? (
							<img
								src={normalizeImageUrl(joinUrl(getBaseUrl(), cleanProfilePictureUrl(user.profilePictureUrl)))}
								alt="Profile"
								className="w-10 h-10 rounded-full object-cover border border-slate-600 shadow-md"
								onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
							/>
						) : (
							<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
								<span className="text-sm font-bold text-white">
									{(user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}
								</span>
							</div>
						)}
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-white truncate">
								{user.firstName} {user.lastName}
							</p>
							<p className="text-xs text-slate-400 truncate">{user.email}</p>
						</div>
					</div>
				)}

				{/* Sign Out Button */}
				<button
					onClick={handleLogout}
					className={`flex items-center w-full px-3 py-2.5 rounded-xl text-slate-300 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200 group ${
						state.sidebarCollapsed ? "justify-center" : ""
					}`}
				>
					<LogOut
						className={`w-5 h-5 ${state.sidebarCollapsed ? "mx-auto" : "mr-3"}`}
					/>
					{!state.sidebarCollapsed && (
						<span className="font-medium text-sm">Sign out</span>
					)}

					{/* Tooltip for collapsed state */}
					{state.sidebarCollapsed && (
						<div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-slate-600">
							Sign out
							<div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-slate-800"></div>
						</div>
					)}
				</button>
			</div>
		</div>
	);
};

export default Sidebar;
