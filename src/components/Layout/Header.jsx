import React, { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useApp } from '../../Context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { getBaseUrl, normalizeImageUrl } from '../../Utils/baseApi';

function joinUrl(base, path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}
function cleanProfilePictureUrl(url) {
  if (!url) return '';
  return url.replace('/images/images/', '/images/');
}

const Header = () => {
  const { state } = useApp();
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();
  console.log(user);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 sticky top-0 z-10">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">System Online</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {state.notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {state.notifications.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <div className="p-4 border-b font-semibold text-gray-900 flex items-center justify-between">
                  Notifications
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => setNotifOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y">
                  {state.notifications.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No new notifications</div>
                  ) : (
                    state.notifications.map((notif, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50 text-sm text-gray-700">
                        {notif.message || notif}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              {user?.profilePictureUrl ? (
                <img
                  src={normalizeImageUrl(joinUrl(getBaseUrl(), cleanProfilePictureUrl(user.profilePictureUrl)))}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow"
                  onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                  </span>
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.roleType}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;