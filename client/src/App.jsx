import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import MyIssues from './pages/MyIssues';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMap from './pages/admin/AdminMap';

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<Protected><ReportIssue /></Protected>} />
        <Route path="/my-issues" element={<Protected><MyIssues /></Protected>} />
        <Route path="/admin" element={<Protected adminOnly><AdminDashboard /></Protected>} />
        <Route path="/admin/map" element={<Protected adminOnly><AdminMap /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}