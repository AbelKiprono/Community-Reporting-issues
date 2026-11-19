import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', ward: 'Nyeri Town' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-indigo-700">Create Account</h1>
        {error && <div className="mb-3 p-2 bg-red-100 text-red-800 rounded text-sm">{error}</div>}
        <label className="block mb-3">
          <span className="text-sm text-gray-700">Full Name</span>
          <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-700">Email</span>
          <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-700">Password (min 6 chars)</span>
          <input type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-700">Ward</span>
          <input value={form.ward} onChange={e => setForm({...form, ward: e.target.value})}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>
        <button disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Creating...' : 'Register'}
        </button>
        <p className="mt-4 text-sm text-center text-gray-600">
          Have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}