import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '../../Context/AppContext';

const Layout = ({ children }) => {
  const { state } = useApp();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${state.sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;