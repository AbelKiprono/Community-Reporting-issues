import { useEffect, useState } from 'react';
import api from '../api/axios';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  acted_on: 'bg-green-100 text-green-800',
  not_done: 'bg-gray-200 text-gray-700',
};

export default function MyIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/issues/my').then(r => setIssues(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!issues.length) return <div className="p-8 text-center text-gray-500">No reports yet. <a href="/report" className="text-indigo-600">Create one</a>.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Reports</h1>
      <div className="space-y-3">
        {issues.map(i => (
          <div key={i.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{i.title}</h3>
                <p className="text-sm text-gray-600">{i.description}</p>
                <div className="text-xs text-gray-500 mt-1">{i.category?.name} · {i.addressText || `${i.lat.toFixed(4)}, ${i.lng.toFixed(4)}`}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[i.status]}`}>{i.status.replace('_', ' ')}</span>
            </div>
            {i.imageUrl && <img src={i.imageUrl} alt="" className="mt-2 max-h-40 rounded" />}
            {i.adminNote && <div className="mt-2 p-2 bg-gray-50 rounded text-sm"><b>Admin note:</b> {i.adminNote}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}