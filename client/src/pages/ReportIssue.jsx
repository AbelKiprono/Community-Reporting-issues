import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { classifyUrgency, levelColor, levelEmoji } from '../utils/urgencyClassifier';
import { MapPin, AlertCircle, Camera } from 'lucide-react';

const CATEGORIES = [
  { id: 1, name: 'Road damage / Pothole' },
  { id: 2, name: 'Garbage collection' },
  { id: 3, name: 'Theft / Security' },
  { id: 4, name: 'Water / Drainage' },
  { id: 5, name: 'Streetlight / Electricity' },
  { id: 6, name: 'Other' },
];

const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [addressText, setAddressText] = useState('');
  const [location, setLocation] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { detectLocation(); }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported by this browser'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      (err) => { setError('Location error: ' + err.message); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const urgency = useMemo(() => classifyUrgency(`${title}. ${description}`), [title, description]);

  // ✅ Validate image before accepting
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, or WEBP images are allowed');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Image is too large. Max ${MAX_IMAGE_MB}MB.`);
      e.target.value = '';
      return;
    }

    setError('');
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!location) { setError('Location required. Click "Detect" to fetch it.'); return; }

    setError('');
    setSubmitting(true);
    try {
      // ✅ Send as multipart/form-data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);
      if (addressText) formData.append('addressText', addressText);
      formData.append('mlUrgencyHint', urgency.level);
      if (imageFile) formData.append('image', imageFile);

      await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/my-issues');
    } catch (err) {
      setError(err.response?.data?.error || 'Submit failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
        <p className="text-gray-500 mt-1">Provide as much detail as possible so we can act quickly.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          {/* Section 1: Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider text-indigo-600">Issue Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)}
                maxLength={150}
                placeholder="e.g. Huge pothole on Kimathi Way"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)}
                maxLength={1000}
                placeholder="Describe the problem. Mention if it is dangerous, who is affected, etc."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>

            {urgency.score > 0 && (
              <div className={`p-4 rounded-lg border ${levelColor(urgency.level)} flex items-start gap-3`}>
                <span className="text-xl">{levelEmoji(urgency.level)}</span>
                <div>
                  <p className="font-semibold text-sm">Urgency Prediction: {urgency.level}</p>
                  <p className="text-xs opacity-80 mt-1">Score: {urgency.score} · Keywords: {urgency.matches.map(m => m.keyword).join(', ')}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Location & Evidence */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider text-indigo-600">Location & Evidence</h2>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Location Coordinates</p>
                  {location ? (
                    <p className="text-xs text-gray-500">📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
                  ) : (
                    <p className="text-xs text-red-500">Not detected</p>
                  )}
                </div>
              </div>
              <button type="button" onClick={detectLocation} disabled={locating}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">
                {locating ? 'Detecting...' : location ? 'Update' : 'Detect'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark / Address (Optional)</label>
              <input value={addressText} onChange={e => setAddressText(e.target.value)}
                maxLength={255}
                placeholder="e.g. Near Kimathi Market"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo Evidence (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors bg-gray-50 relative">
                <div className="space-y-1 text-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="mx-auto h-32 object-cover rounded-md mb-2" />
                  ) : (
                    <Camera className="mx-auto h-10 w-10 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>{preview ? 'Change photo' : 'Upload a file'}</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="sr-only" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG, WEBP · Max {MAX_IMAGE_MB}MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button disabled={submitting} type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}