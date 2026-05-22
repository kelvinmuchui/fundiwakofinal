'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BookingModal from '../../../components/BookingModal';
import ReviewSection from '../../../components/ReviewSection';
import PortfolioGallery from '../../../components/PortfolioGallery';

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
  showcasePhotos?: string[];
  rating?: number;
  jobsCompleted?: number;
  profileViews?: number;
}

export default function PublicFundiProfile() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicFundiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactClicked, setContactClicked] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews'>('about');

  useEffect(() => {
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
    if (!id) { setError('Fundi ID missing'); setLoading(false); return; }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/fundi/public/${id}`);
        if (!res.ok) { const err = await res.json(); setError(err.error || 'Unable to load profile'); return; }
        const data = await res.json();
        setProfile(data);
        trackEngagement('view', id);
      } catch (err) {
        console.error('Public profile fetch error:', err);
        setError('Unable to load profile');
      } finally { setLoading(false); }
    };

    const trackEngagement = async (type: 'view' | 'contact', fundiId: string) => {
      try { await fetch(`/api/fundi/${fundiId}/track?type=${type}`, { method: 'POST' }); } catch {}
    };

    fetchProfile();
  }, [params]);

  const handleContact = async () => {
    if (contactClicked || !profile?._id) return;
    setIsTracking(true);
    try {
      await fetch(`/api/fundi/${profile._id}/track?type=contact`, { method: 'POST' });
      setContactClicked(true);
      document.getElementById('contact-info')?.scrollIntoView({ behavior: 'smooth' });
    } catch {} finally { setIsTracking(false); }
  };

  const getAvailabilityStyle = (avail?: string) => {
    if (avail === 'available' || avail === 'Available Now') return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Available Now' };
    if (avail === 'busy' || avail === 'Busy') return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Busy' };
    return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Flexible Schedule' };
  };

  if (loading) return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
      <p className="text-neutral-500 font-medium animate-pulse">Loading artisan profile...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-heading font-bold text-secondary-500 mb-2">Oops! Profile not found</h2>
        <p className="text-neutral-500 mb-6">{error}</p>
        <button onClick={() => router.back()} className="btn-primary w-full">Go Back</button>
      </div>
    </div>
  );

  if (!profile) return <div className="min-h-screen flex items-center justify-center">No profile data</div>;

  const avail = getAvailabilityStyle(profile.availability);

  const tabs = [
    { id: 'about' as const, label: 'About', icon: '👤' },
    { id: 'portfolio' as const, label: 'Portfolio', icon: '🎨' },
    { id: 'reviews' as const, label: 'Reviews', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Dynamic Hero Section */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-40"
          style={{ backgroundImage: `url(${profile.photoURL || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800'})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/40 via-secondary-900/60 to-neutral-50" />

        <div className="container-max relative h-full flex flex-col justify-end pb-12 px-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="relative group">
              <div className="absolute inset-0 bg-white rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <img src={profile.photoURL || 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?auto=format&fit=crop&q=80&w=400'}
                alt={profile.name} className="w-32 h-32 md:w-48 md:h-48 rounded-3xl object-cover border-4 border-white shadow-2xl relative z-10" />
              {profile.isVerified && (
                <div className="absolute -top-3 -right-3 bg-white p-2 rounded-2xl shadow-lg z-20">
                  <div className="bg-emerald-500 text-white p-1 rounded-xl">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-heading font-black text-white drop-shadow-lg">{profile.name}</h1>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-bold uppercase tracking-wider">
                    {profile.skill || 'Professional'}
                  </span>
                  <span className={`px-3 py-1.5 ${avail.bg} rounded-full text-xs font-bold ${avail.text} flex items-center gap-1.5`}>
                    <span className={`w-2 h-2 rounded-full ${avail.dot} animate-pulse`}></span>
                    {avail.label}
                  </span>
                </div>
              </div>
              <p className="flex items-center justify-center md:justify-start gap-2 text-white/90 text-lg">
                <svg className="w-5 h-5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {profile.neighborhood}, {profile.location}
              </p>
            </div>

            <button onClick={() => router.back()}
              className="absolute top-0 right-0 mt-8 mr-4 px-6 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all font-bold text-sm">
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container-max px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-1.5 flex gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'text-neutral-500 hover:bg-neutral-50'
              }`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-max py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Tab */}
            {activeTab === 'about' && (
              <>
                {/* Bio Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100">
                  <h3 className="text-2xl font-heading font-bold text-secondary-500 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center text-xl">👤</span>
                    Professional Bio
                  </h3>
                  <p className="text-neutral-600 text-lg leading-relaxed mb-8">
                    {profile.description || "As an experienced artisan, I take pride in delivering high-quality work with attention to detail."}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl text-center group">
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🏆</div>
                      <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-0.5">Experience</p>
                      <p className="text-sm font-heading font-bold text-secondary-900">{profile.experience || "5+ Years"}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl text-center group">
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎓</div>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Certification</p>
                      <p className="text-sm font-heading font-bold text-secondary-900">{profile.tvetInstitution ? "TVET Certified" : "Verified"}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl text-center group">
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">⭐</div>
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">Rating</p>
                      <p className="text-sm font-heading font-bold text-secondary-900">{profile.rating ? `${profile.rating}/5` : 'New'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl text-center group">
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">✅</div>
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">Jobs Done</p>
                      <p className="text-sm font-heading font-bold text-secondary-900">{profile.jobsCompleted || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Skills & Services */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100">
                  <h3 className="text-2xl font-heading font-bold text-secondary-500 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-xl">🛠️</span>
                    Skills & Services
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, idx) => (
                        <span key={idx} className="px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 rounded-xl text-sm font-bold border border-primary-200/50 hover:shadow-md hover:shadow-primary-100 transition-all cursor-default">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-bold">{profile.skill}</span>
                    )}
                  </div>

                  {profile.tvetInstitution && (
                    <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">🎓</div>
                        <div>
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">TVET Certified</p>
                          <p className="text-sm font-bold text-secondary-900">{profile.tvetInstitution}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Showcase Photos */}
                {profile.showcasePhotos && profile.showcasePhotos.length > 0 && (
                  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100">
                    <h3 className="text-2xl font-heading font-bold text-secondary-500 mb-6 flex items-center gap-3">
                      <span className="w-10 h-10 bg-accent-100 rounded-2xl flex items-center justify-center text-xl">✨</span>
                      Work Showcase
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {profile.showcasePhotos.map((photo, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded-2xl group relative cursor-pointer shadow-md">
                          <img src={photo} alt={`Work ${index + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold text-sm">View Work</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <PortfolioGallery fundiId={profile._id} isOwner={false} />
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <ReviewSection fundiId={profile._id} fundiName={profile.name} />
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-secondary-900 rounded-[2rem] p-8 shadow-2xl text-white sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-primary-400 font-bold text-xs uppercase tracking-widest mb-1">Starting From</p>
                  <h3 className="text-3xl font-heading font-black">
                    KES {profile.hourlyRate?.replace(/[^0-9]/g, '') || "1,200"}
                    <span className="text-sm font-normal text-white/60">/hr</span>
                  </h3>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                  <div className="flex items-center gap-1">
                    <span className="text-accent-400">★</span>
                    <span className="font-black text-xl">{profile.rating?.toFixed(1) || '—'}</span>
                  </div>
                  <p className="text-[10px] text-white/50 text-center uppercase font-bold">{profile.jobsCompleted || 0} Jobs</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">🕒</div>
                  <span>{profile.availability || "Flexible Schedule"}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">✅</div>
                  <span>{profile.isVerified ? 'Verified Identity & Skill' : 'Pending Verification'}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">📍</div>
                  <span>Serves {profile.neighborhood || "Nairobi Area"}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">👁️</div>
                  <span>{profile.profileViews || 0} profile views</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => setShowBookingModal(true)}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-heading font-black text-lg transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 group">
                  <span className="group-hover:scale-125 transition-transform">📅</span> Book Appointment
                </button>
                <button onClick={handleContact} disabled={contactClicked || isTracking}
                  className={`w-full py-4 rounded-2xl font-heading font-black text-lg transition-all border-2 flex items-center justify-center gap-2 ${
                    contactClicked ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-white/20 hover:bg-white hover:text-secondary-900 text-white'
                  }`}>
                  {isTracking ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    : contactClicked ? <><span>✓</span> Contact Revealed</>
                    : <><span>📞</span> Show Phone Number</>}
                </button>
              </div>

              {/* Revealed Contact Info */}
              {contactClicked && (
                <div id="contact-info" className="mt-6 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <div className="space-y-4">
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">📱</div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase">Mobile Number</p>
                        <p className="text-lg font-bold group-hover:text-primary-400 transition-colors">{profile.phone}</p>
                      </div>
                    </a>
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">✉️</div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase">Email Address</p>
                        <p className="text-sm font-bold group-hover:text-primary-400 transition-colors">{profile.email}</p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Badge */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-3">🛡️</div>
              <h4 className="font-heading font-bold text-emerald-900 mb-1">FundiWako Protected</h4>
              <p className="text-emerald-700 text-xs leading-relaxed">
                Your bookings and payments are secured through our platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BookingModal fundiId={profile._id} fundiName={profile.name} isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} />
    </div>
  );
}
