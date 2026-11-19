import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-indigo-700 mb-4">Nyeri Town Community Report</h1>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Report issues in your ward — potholes, garbage, theft, water problems, broken streetlights.
        Your ward administrator sees your report, plans action, and updates the status.
      </p>
      {user ? (
        user.role === 'citizen' ? (
          <div className="flex gap-3 justify-center">
            <Link to="/report" className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700">Report an Issue</Link>
            <Link to="/my-issues" className="bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300">View My Reports</Link>
          </div>
        ) : (
          <div className="flex gap-3 justify-center">
            <Link to="/admin" className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700">Admin Dashboard</Link>
            <Link to="/admin/map" className="bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300">View Map</Link>
          </div>
        )
      ) : (
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700">Login</Link>
          <Link to="/register" className="bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300">Register</Link>
        </div>
      )}
    </div>
  );
}