import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-indigo-700">🏛️ Nyeri Report</Link>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                {user.role === 'citizen' && (
                  <>
                    <Link to="/report" className="hover:text-indigo-600">Report Issue</Link>
                    <Link to="/my-issues" className="hover:text-indigo-600">My Issues</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="hover:text-indigo-600">Dashboard</Link>
                    <Link to="/admin/map" className="hover:text-indigo-600">Map</Link>
                  </>
                )}
                <span className="text-gray-600">{user.fullName}</span>
                <button onClick={handleLogout} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-indigo-600">Login</Link>
                <Link to="/register" className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-gray-500 py-4">
        Nyeri Town Community Reporting System · Final Year Project
      </footer>
    </div>
  );
}