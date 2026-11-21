import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, ShieldCheck, Clock, ArrowRight, Activity } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-8">
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4 border border-indigo-100">
          <MapPin className="w-4 h-4" /> Serving Nyeri Town
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Report community issues. <br className="hidden md:block"/>
          <span className="text-indigo-600">Track their resolution.</span>
        </h1>
        <p className="text-lg text-gray-600">
          A direct line to your ward administrator. Report infrastructure damage, security concerns, 
          and public hazards. We prioritize by urgency and act fast.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            user.role === 'citizen' ? (
              <>
                <Link to="/report" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-sm w-full sm:w-auto justify-center">
                  Report an Issue <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/my-issues" className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-8 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-all w-full sm:w-auto justify-center">
                  View My Reports
                </Link>
              </>
            ) : (
              <Link to="/admin" className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-sm w-full sm:w-auto justify-center">
                Admin Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            )
          ) : (
            <>
              <Link to="/register" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-sm w-full sm:w-auto justify-center">
                Create an Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-8 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-all w-full sm:w-auto justify-center">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Location Mapping</h3>
          <p className="text-gray-600 text-sm">Every report is mapped so the ward team knows exactly where to go.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Urgency Ranking</h3>
          <p className="text-gray-600 text-sm">Issues are automatically scored and sorted based on community impact.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Direct Action</h3>
          <p className="text-gray-600 text-sm">Track the status of your report from Pending to Acted On.</p>
        </div>
      </section>
    </div>
  );
}