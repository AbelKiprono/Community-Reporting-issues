import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const u = await login(email, password);
      navigate(u.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-indigo-700">Login to Nyeri Report</h1>
        {error && <div className="mb-3 p-2 bg-red-100 text-red-800 rounded text-sm">{error}</div>}
        <label className="block mb-3">
          <span className="text-sm text-gray-700">Email</span>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-700">Password</span>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>
        <button disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="mt-4 text-sm text-center text-gray-600">
          No account? <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
        </p>
        <p className="mt-2 text-xs text-center text-gray-400">
          Demo admin: admin@nyeri.go.ke / Admin@123
        </p>
      </form>
    </div>
  );
}