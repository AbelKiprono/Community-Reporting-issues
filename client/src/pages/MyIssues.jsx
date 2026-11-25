import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { imageUrl } from '../api/axios';
import { format } from 'date-fns';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  acted_on: 'bg-green-100 text-green-800 border-green-200',
  not_done: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function MyIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/issues/my').then(r => setIssues(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading your reports...</div>;
  if (!issues.length) return (
    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No reports yet</h3>
      <p className="text-gray-500 mt-1 mb-6">Help improve Nyeri Town by reporting an issue.</p>
      <Link to="/report" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
        Create your first report <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-500 mt-1">Track the progress of issues you've submitted.</p>
        </div>
      </div>

      <div className="space-y-4">
        {issues.map(i => (
          <div key={i.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
            
            {/* Image Thumbnail */}
            <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
              {i.imageUrl ? (
                <img src={imageUrl(i.imageUrl)} alt={i.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">No photo</span>
              )}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[i.status]}`}>
                {i.status.replace('_', ' ')}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{i.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
  <MapPin className="w-3 h-3" />
  {i.addressText || (i.lat != null && i.lng != null ? `${i.lat.toFixed(3)}, ${i.lng.toFixed(3)}` : 'Location unavailable')}
</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(i.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 shrink-0">
                    Urgency: {i.urgencyScore}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-3 line-clamp-2">{i.description}</p>
              </div>

              {i.adminNote && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 flex items-start gap-2">
                  <span className="font-semibold shrink-0">Admin Update:</span> {i.adminNote}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}