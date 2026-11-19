import { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  acted_on: 'bg-green-100 text-green-800',
  not_done: 'bg-gray-200 text-gray-700',
};

function StatCard({ label, value, color }) {
  return (
    <div className={`p-3 rounded-lg ${color}`}>
      <div className="text-xs opacity-75">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const load = async () => {
    setLoading(true);
    const [issuesRes, statsRes] = await Promise.all([
      api.get(`/issues?sort=urgency${filter ? '&status=' + filter : ''}`),
      api.get('/issues/stats'),
    ]);
    setIssues(issuesRes.data);
    setStats(statsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const startEdit = (issue) => { setEditing(issue); setNewStatus(issue.status); setNote(issue.adminNote || ''); };
  const saveStatus = async () => { await api.patch(`/issues/${editing.id}/status`, { status: newStatus, note }); setEditing(null); load(); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} color="bg-indigo-100 text-indigo-800" />
          <StatCard label="Pending" value={stats.byStatus.pending} color="bg-yellow-100 text-yellow-800" />
          <StatCard label="In Progress" value={stats.byStatus.in_progress} color="bg-blue-100 text-blue-800" />
          <StatCard label="Acted On" value={stats.byStatus.acted_on} color="bg-green-100 text-green-800" />
          <StatCard label="Not Done" value={stats.byStatus.not_done} color="bg-gray-200 text-gray-700" />
        </div>
      )}
      <div className="mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="acted_on">Acted On</option>
          <option value="not_done">Not Done</option>
        </select>
      </div>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {issues.map(i => (
            <div key={i.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{i.title}</h3>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Urgency {i.urgencyScore}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{i.description}</p>
                  <div className="text-xs text-gray-500 mt-1">{i.category?.name} · {i.user?.fullName || 'Unknown'} · {i.addressText || `${i.lat.toFixed(4)}, ${i.lng.toFixed(4)}`}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[i.status]}`}>{i.status.replace('_', ' ')}</span>
                  <button onClick={() => startEdit(i)} className="text-sm text-indigo-600 hover:underline">Update status</button>
                </div>
              </div>
               {i.imageUrl && <img src={i.imageUrl} alt="" className="mt-2 max-h-40 rounded" />}
            </div>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-3">Update: {editing.title}</h2>
            <label className="block mb-3">
              <span className="text-sm">Status</span>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="acted_on">Acted On</option>
                <option value="not_done">Not Done</option>
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-sm">Note</span>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border rounded" />
            </label>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={saveStatus} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}