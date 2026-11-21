import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, MapPin, X, Search } from 'lucide-react';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  acted_on: 'bg-green-100 text-green-800',
  not_done: 'bg-gray-200 text-gray-700',
};

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Manage and track incoming community reports.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-transparent text-sm outline-none text-gray-700 font-medium cursor-pointer">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="acted_on">Acted On</option>
            <option value="not_done">Not Done</option>
          </select>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Issues</p>
              <AlertCircle className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byStatus.pending}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byStatus.in_progress}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byStatus.acted_on}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-medium">Issue</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Urgency</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 animate-pulse">Loading issues...</td></tr>
              ) : issues.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No issues found.</td></tr>
              ) : (
                issues.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{i.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{i.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {i.addressText || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                        {i.urgencyScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[i.status]}`}>
                        {i.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => startEdit(i)} className="text-sm font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Update Status</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="font-medium text-gray-900">{editing.title}</p>
                <p className="text-sm text-gray-500 mt-1">{editing.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="acted_on">Acted On</option>
                  <option value="not_done">Not Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (visible to citizen)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="e.g. Road crew dispatched, expected completion Friday."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</button>
              <button onClick={saveStatus} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}