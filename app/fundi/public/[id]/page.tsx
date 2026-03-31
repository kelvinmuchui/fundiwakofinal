'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface PublicFundiProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  skill: string;
  skills?: string[];
  experience: string;
  description: string;
  location: string;
  neighborhood: string;
  availability?: string;
  hourlyRate?: string;
  tvetInstitution?: string;
  reasonForJoining?: string;
  photoURL?: string;
  isVerified?: boolean;
}

export default function PublicFundiProfile() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicFundiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactClicked, setContactClicked] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const id = params?.id;
    if (!id) {
      setError('Fundi ID missing');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/fundi/public/${id}`);
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Unable to load profile');
          return;
        }

        const data = await res.json();
        setProfile(data);
        
        // Track view
        trackEngagement('view', id);
      } catch (err) {
        console.error('Public profile fetch error:', err);
        setError('Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    const trackEngagement = async (type: 'view' | 'contact', fundiId: string) => {
      try {
        await fetch(`/api/fundi/${fundiId}/track?type=${type}`, {
          method: 'POST',
        });
      } catch (err) {
        console.error(`Error tracking ${type}:`, err);
      }
    };

    fetchProfile();
  }, [params]);

  const handleContact = async () => {
    if (contactClicked || !profile?._id) return;
    
    setIsTracking(true);
    try {
      await fetch(`/api/fundi/${profile._id}/track?type=contact`, {
        method: 'POST',
      });
      setContactClicked(true);
      // Optional: scroll to contact info
      document.getElementById('contact-info')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error tracking contact click:', err);
    } finally {
      setIsTracking(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading public profile...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">No profile data</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="absolute inset-0 opacity-30 bg-black" />
          <div className="absolute top-4 right-4"> </div>
        </div>

        <div className="px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gray-100">
                {profile.photoURL ? <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-3xl">👤</div>}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-lg text-gray-600">{profile.skill || 'Service provider'}</p>
                <p className="text-sm text-gray-500">{profile.location}, {profile.neighborhood}</p>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
            >
              Back
            </button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">About</h2>
                <p className="text-gray-700">{profile.description || 'No bio yet.'}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Experience</h2>
                <p className="text-gray-700">{profile.experience || 'Not specified'}</p>
                <p className="text-gray-500 text-sm">{profile.tvetInstitution || 'No institution listed'}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills?.length ? profile.skills : [profile.skill || 'Not specified']).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleContact}
                disabled={contactClicked || isTracking}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                  contactClicked 
                    ? 'bg-emerald-500 text-white cursor-default' 
                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isTracking ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : contactClicked ? (
                  <><span>✅</span> Contacted!</>
                ) : (
                  <><span>📞</span> Contact Fundi</>
                )}
              </button>

              <div id="contact-info" className={`p-4 rounded-lg transition-all duration-500 ${contactClicked ? 'bg-emerald-50 ring-2 ring-emerald-500 scale-105' : 'bg-slate-100'}`}>
                <h3 className="text-md font-semibold flex items-center gap-2">
                  Contact Information {contactClicked && <span className="text-emerald-600 text-xs font-bold animate-bounce hidden sm:inline">Revealed!</span>}
                </h3>
                <p className="text-gray-700 mt-2">Email: {profile.email}</p>
                <p className="text-gray-700">Phone: {profile.phone || 'Not provided'}</p>
              </div>

              <div className="bg-slate-100 p-4 rounded-lg">
                <h3 className="text-md font-semibold">Availability</h3>
                <p className="text-gray-700">{profile.availability || 'Flexible'}</p>
                <p className={`mt-2 inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${profile.isVerified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                  {profile.isVerified ? 'Verified' : 'Awaiting verification'}
                </p>
              </div>

              <div className="bg-slate-100 p-4 rounded-lg">
                <h3 className="text-md font-semibold">Rate</h3>
                <p className="text-gray-700">KES {profile.hourlyRate || 'Not set'} / hour</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
