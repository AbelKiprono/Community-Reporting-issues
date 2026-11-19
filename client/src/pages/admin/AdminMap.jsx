import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function colorFor(status) {
  const colors = { pending: '#eab308', in_progress: '#3b82f6', acted_on: '#22c55e', not_done: '#6b7280' };
  return colors[status] || '#888';
}

export default function AdminMap() {
  const [issues, setIssues] = useState([]);

  useEffect(() => { api.get('/issues?sort=urgency').then(r => setIssues(r.data)); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Issue Map — Nyeri Town</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        <MapContainer center={[-0.4167, 36.9500]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors' />
          {issues.map(i => (
            <Marker key={i.id} position={[i.lat, i.lng]}
              icon={L.divIcon({
                className: '',
                html: `<div style="background:${colorFor(i.status)};width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>`,
                iconSize: [20, 20], iconAnchor: [10, 10],
              })}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{i.title}</div>
                  <div className="text-xs text-gray-600 mt-1">Urgency: {i.urgencyScore}</div>
                  <div className="text-xs mt-1">Status: {i.status}</div>
                  {i.addressText && <div className="text-xs mt-1">{i.addressText}</div>}
                  {i.imageUrl && <img src={i.imageUrl} alt="" className="mt-2 max-w-[150px] rounded" />}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="mt-3 flex gap-3 text-xs">
        <span><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>Pending</span>
        <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>In Progress</span>
        <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>Acted On</span>
        <span><span className="inline-block w-3 h-3 rounded-full bg-gray-500 mr-1"></span>Not Done</span>
      </div>
    </div>
  );
}