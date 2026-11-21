import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, Map, PlusCircle, LogOut, Shield, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinkClass = (path) => 
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
      location.pathname === path 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar for Admin (Desktop) */}
      {user?.role === 'admin' && (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex sticky top-0 h-screen">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Link to="/" className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" /> Nyeri Admin
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/admin" className={navLinkClass('/admin')}><Home className="w-4 h-4" /> Dashboard</Link>
            <Link to="/admin/map" className={navLinkClass('/admin/map')}><Map className="w-4 h-4" /> Issue Map</Link>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {user.fullName.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 leading-tight">{user.fullName}</p>
                <p className="text-gray-500 text-xs">Administrator</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium w-full px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <Link to="/" className="text-lg font-bold text-gray-900 md:hidden">Nyeri Report</Link>
            <div className="hidden md:block">
              {user ? (
                 <h2 className="text-lg font-semibold text-gray-800 capitalize">
                   {location.pathname === '/' ? 'Home' : location.pathname.split('/').pop().replace('-', ' ')}
                 </h2>
              ) : (
                 <Link to="/" className="text-xl font-bold text-gray-900">Nyeri Community Report</Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'citizen' && (
                  <Link to="/report" className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    <PlusCircle className="w-4 h-4" /> Report Issue
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600 hidden md:block">{user.fullName}</span>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Log in</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">Sign up</Link>
              </div>
            )}
          </div>
        </header>

        {/* Citizen Mobile Nav */}
        {user?.role === 'citizen' && (
          <div className="md:hidden bg-white border-b border-gray-200 flex justify-around p-2 sticky top-16 z-10 shadow-sm">
            <Link to="/" className={navLinkClass('/')}><Home className="w-4 h-4" /> Home</Link>
            <Link to="/report" className={navLinkClass('/report')}><PlusCircle className="w-4 h-4" /> Report</Link>
            <Link to="/my-issues" className={navLinkClass('/my-issues')}><FileText className="w-4 h-4" /> Mine</Link>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}