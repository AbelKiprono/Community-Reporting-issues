import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { classifyUrgency, levelColor, levelEmoji } from '../utils/urgencyClassifier';

const CATEGORIES = [
  { id: 1, name: 'Road damage / Pothole' },
  { id: 2, name: 'Garbage collection' },
  { id: 3, name: 'Theft / Security' },
  { id: 4, name: 'Water / Drainage' },
  { id: 5, name: 'Streetlight / Electricity' },
  { id: 6, name: 'Other' },
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [addressText, setAddressText] = useState('');
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { detectLocation(); }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      (err) => { setError('Location error: ' + err.message); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const urgency = useMemo(() => classifyUrgency(`${title}. ${description}`), [title, description]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!location) { setError('Location required. Click "Detect Location".'); return; }
    setError(''); setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        categoryId,
        lat: location.lat,
        lng: location.lng,
        addressText,
        mlUrgencyHint: urgency.level,
        imageData: image
      };

      await api.post('/issues', payload); // JSON request now
      navigate('/my-issues');
    } catch (err) {
      setError(err.response?.data?.error || 'Submit failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Report an Issue</h1>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}
      <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input required value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Huge pothole on Kimathi Way"
            className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Describe the problem. Mention if it is dangerous, who is affected, etc."
            className="mt-1 w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500" />
        </label>
        {urgency.score > 0 && (
          <div className={`p-3 rounded border ${levelColor(urgency.level)}`}>
            <div className="font-medium">{levelEmoji(urgency.level)} Detected urgency: {urgency.level}</div>
            <div className="text-xs mt-1">Score: {urgency.score} · Keywords: {urgency.matches.map(m => m.keyword).join(', ')}</div>
          </div>
        )}
        <label className="block">
          <span className="text-sm font-medium">Category</span>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded">
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="p-3 bg-gray-50 rounded">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Location</div>
              {location ? <div className="text-xs text-gray-600">📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</div>
                : <div className="text-xs text-gray-500">Not detected</div>}
            </div>
            <button type="button" onClick={detectLocation} disabled={locating}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
              {locating ? 'Detecting...' : location ? 'Re-detect' : 'Detect Location'}
            </button>
          </div>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Address (optional)</span>
          <input value={addressText} onChange={e => setAddressText(e.target.value)}
            placeholder="e.g. Kimathi Way, near the market"
            className="mt-1 w-full px-3 py-2 border rounded" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Photo (optional)</span>
          <input type="file" accept="image/*" onChange={handleImage} className="mt-1 w-full" />
          {preview && <img src={preview} alt="preview" className="mt-2 rounded max-h-48" />}
        </label>
        <button disabled={submitting} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}