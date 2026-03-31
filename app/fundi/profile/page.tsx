'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FundiProfile {
    _id?: string;
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
    isVerified: boolean;
}

export default function FundiProfile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [profileData, setProfileData] = useState<FundiProfile | null>(null);
    const [formData, setFormData] = useState<FundiProfile>({
        name: '',
        email: '',
        phone: '',
        skill: '',
        skills: [],
        experience: '',
        description: '',
        location: '',
        neighborhood: '',
        availability: 'flexible',
        hourlyRate: '',
        tvetInstitution: '',
        reasonForJoining: '',
        isVerified: false,
    });
    const [newSkill, setNewSkill] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
    const [skillSuggestions] = useState([
        'Plumbing', 'Electrical Work', 'Carpentry', 'Painting', 'Tiling', 'Masonry',
        'Welding', 'Auto Repair', 'HVAC', 'Roofing', 'Flooring', 'Drywall',
        'Landscaping', 'Pest Control', 'Locksmith', 'Appliance Repair'
    ]);

    useEffect(() => {
        if (status === 'loading') return;
        
        if (!session || !session.user) {
            router.push('/auth');
            return;
        }

        const userRole = (session?.user as any)?.role;
        if (userRole !== 'fundi') {
            router.push('/');
            return;
        }

        fetchProfileData();
    }, [session, status, router]);

    const fetchProfileData = async () => {
        try {
            const res = await fetch('/api/fundi/profile');
            if (res.ok) {
                const data = await res.json();
                const mergedData = {
                    name: data.name || (session?.user as any)?.name || '',
                    email: data.email || (session?.user as any)?.email || '',
                    phone: data.phone || '',
                    skill: data.skill || '',
                    skills: data.skills || (data.skill ? [data.skill] : []),
                    experience: data.experience || '',
                    description: data.description || '',
                    location: data.location || '',
                    neighborhood: data.neighborhood || '',
                    availability: data.availability || 'flexible',
                    hourlyRate: data.hourlyRate || '',
                    tvetInstitution: data.tvetInstitution || '',
                    reasonForJoining: data.reasonForJoining || '',
                    photoURL: data.photoURL || undefined,
                    isVerified: data.isVerified ?? false,
                };

                setProfileData(mergedData as FundiProfile);
                setFormData(mergedData as FundiProfile);
            } else {
                // fallback to session data if profile not found
                const fallback = {
                    name: (session?.user as any)?.name || '',
                    email: (session?.user as any)?.email || '',
                    phone: '',
                    skill: '',
                    skills: [],
                    experience: '',
                    description: '',
                    location: '',
                    neighborhood: '',
                    availability: 'flexible',
                    hourlyRate: '',
                    tvetInstitution: '',
                    reasonForJoining: '',
                    photoURL: undefined,
                    isVerified: false,
                };
                setProfileData(fallback);
                setFormData(fallback);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfileData({
                name: (session?.user as any)?.name || '',
                email: (session?.user as any)?.email || '',
                phone: '',
                skill: '',
                skills: [],
                experience: '',
                description: '',
                location: '',
                neighborhood: '',
                availability: 'flexible',
                hourlyRate: '',
                tvetInstitution: '',
                reasonForJoining: '',
                photoURL: undefined,
                isVerified: false,
            });
            setFormData({
                name: (session?.user as any)?.name || '',
                email: (session?.user as any)?.email || '',
                phone: '',
                skill: '',
                skills: [],
                experience: '',
                description: '',
                location: '',
                neighborhood: '',
                availability: 'flexible',
                hourlyRate: '',
                tvetInstitution: '',
                reasonForJoining: '',
                photoURL: undefined,
                isVerified: false,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills?.includes(newSkill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...(prev.skills || []), newSkill]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills?.filter(s => s !== skillToRemove) || []
        }));
    };

    const saveProfile = async () => {
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const updateData = {
                ...formData,
                skill: formData.skills?.[0] || formData.skill,
                skills: formData.skills || [],
                photoURL: photoPreview || profileData?.photoURL || undefined
            };

            const res = await fetch('/api/fundi/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
                credentials: 'include'
            });

            if (res.ok) {
                const updated = await res.json();
                setProfileData(updated);
                setIsEditing(false);
                setPhotoPreview(null);
                setPhotoFile(null);
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const error = await res.json();
                setErrorMessage(error.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setErrorMessage('Error saving profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center pt-20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    const user = session?.user as any;
    const combinedProfile = profileData || {
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        skill: '',
        skills: [],
        experience: '',
        description: '',
        location: '',
        neighborhood: '',
        availability: 'flexible',
        hourlyRate: '',
        tvetInstitution: '',
        reasonForJoining: '',
        photoURL: undefined,
        isVerified: false,
    };

    const displayData = isEditing ? formData : combinedProfile;
    const publicProfileId = profileData?._id || (displayData as FundiProfile)._id;

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Your Professional Profile</h1>
                            <p className="text-gray-600 text-sm">Manage and showcase your skills</p>
                        </div>
                        <div className="flex gap-3">
                            {!isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                        setFormData(profileData || formData);
                                    }}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors text-sm font-medium"
                                >
                                    Edit Profile
                                </button>
                            )}
                            {isEditing && (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-full transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveProfile}
                                        disabled={saving}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-full transition-colors text-sm font-medium"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => signOut()}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors text-sm font-medium"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mt-4">
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mt-4">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {!isEditing ? (
                    // View Mode - LinkedIn Style
                    <div className="bg-white shadow-sm">
                        {/* Cover Photo */}
                        <div className="h-48 bg-gradient-to-r from-primary-600 to-secondary-600 relative">
                            <div className="absolute inset-0 bg-black/20"></div>
                            {/* Decorative elements */}
                            <div className="absolute top-4 right-4 text-white/30">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                                </svg>
                            </div>
                        </div>

                        {/* Profile Header */}
                        <div className="px-8 pb-6">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 relative z-10">
                                {/* Profile Picture */}
                                <div className="flex-shrink-0 mb-4 md:mb-0">
                                    {displayData?.photoURL ? (
                                        <img
                                            src={displayData.photoURL}
                                            alt={displayData.name}
                                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center border-4 border-white shadow-lg">
                                            <span className="text-4xl">👤</span>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Actions */}
                                <div className="flex gap-2 mb-4 md:mb-0">
                                    <button
                                        onClick={() => signOut()}
                                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors font-medium"
                                    >
                                        Sign Out
                                    </button>
                                    {publicProfileId && (
                                      <a
                                        href={`/fundi/public/${publicProfileId}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors font-medium"
                                      >
                                        Public Profile
                                      </a>
                                    )}
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="mt-4">
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">{displayData?.name}</h1>
                                <p className="text-xl text-gray-600 mb-2">{displayData?.skill}</p>
                                <div className="flex items-center gap-4 text-gray-500 mb-3">
                                    <span>{displayData?.location}, {displayData?.neighborhood}</span>
                                    <span>•</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${displayData?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {displayData?.isVerified ? 'Verified Professional' : 'Pending Verification'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-500">
                                    <span>{displayData?.experience} of experience</span>
                                    <span>•</span>
                                    <span>Available: {displayData?.availability}</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="px-8 pb-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* About Section */}
                                    {displayData?.description && (
                                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                                            <p className="text-gray-700 leading-relaxed">{displayData.description}</p>
                                        </div>
                                    )}

                                    {/* Experience Section */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{displayData?.skill}</h3>
                                                    <p className="text-gray-600">{displayData?.experience}</p>
                                                    {displayData?.tvetInstitution && (
                                                        <p className="text-sm text-gray-500 mt-1">{displayData.tvetInstitution}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills Section */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {displayData?.skills && displayData.skills.length > 0 ? (
                                                displayData.skills.map((skill, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                    {displayData?.skill || 'No skills specified'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Contact Info */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-gray-700">{displayData?.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-gray-700">{displayData?.phone || 'Not provided'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-gray-700">{displayData?.location}, {displayData?.neighborhood}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Availability Status */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${displayData?.availability === 'available' ? 'bg-green-500' : displayData?.availability === 'busy' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                            <span className="text-gray-700 capitalize">{displayData?.availability || 'Flexible'}</span>
                                        </div>
                                    </div>

                                    {/* Verification Status */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Status</h2>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${displayData?.isVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {displayData?.isVerified ? '✓' : '⏳'}
                                            </div>
                                            <span className="text-gray-700">
                                                {displayData?.isVerified ? 'Verified Professional' : 'Awaiting Admin Verification'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Ratings & Reviews */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ratings & Reviews</h2>
                                        <div className="space-y-4">
                                            {/* Overall Rating */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <svg
                                                            key={star}
                                                            className={`w-5 h-5 ${star <= 4.5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="text-lg font-semibold text-gray-900">4.5</span>
                                                <span className="text-gray-600">(12 reviews)</span>
                                            </div>

                                            {/* Recent Reviews */}
                                            <div className="space-y-3">
                                                <div className="border-t border-gray-100 pt-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">John M.</span>
                                                        <span className="text-sm text-gray-500">2 weeks ago</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">"Excellent work on my kitchen plumbing. Very professional and completed the job on time. Highly recommended!"</p>
                                                </div>

                                                <div className="border-t border-gray-100 pt-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4].map((star) => (
                                                                <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            ))}
                                                            <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">Sarah K.</span>
                                                        <span className="text-sm text-gray-500">1 month ago</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">"Good work overall, but there was a small delay in starting the project. The quality was satisfactory."</p>
                                                </div>
                                            </div>

                                            {/* View All Reviews Link */}
                                            <div className="border-t border-gray-100 pt-3">
                                                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                                    View all 12 reviews →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Edit Mode - LinkedIn Style
                    <div className="bg-white shadow-sm mt-6">
                        <div className="px-8 py-6 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900">Edit Profile</h2>
                            <p className="text-gray-600 mt-1">Update your professional information</p>
                        </div>
                        <div className="px-8 py-6">
                            {/* Profile Photo Section */}
                            <div className="mb-8">
                                <label className="block text-lg font-semibold text-gray-900 mb-4">Profile Photo</label>
                                <div className="flex items-center gap-6">
                                    <div className="flex-shrink-0">
                                        {photoPreview || displayData?.photoURL ? (
                                            <img
                                                src={photoPreview || displayData?.photoURL}
                                                alt="Preview"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                                                <span className="text-2xl">📷</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        <p className="text-sm text-gray-500 mt-2">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
                                    </div>
                                </div>
                            </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Skill</label>
                                <input
                                    type="text"
                                    name="skill"
                                    value={formData.skill}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g., Plumbing"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g., 5+ years"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (KES)</label>
                                <input
                                    type="number"
                                    name="hourlyRate"
                                    value={formData.hourlyRate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g., 500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g., Nairobi"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Neighborhood</label>
                                <input
                                    type="text"
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g., Westlands"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                                <select
                                    name="availability"
                                    value={formData.availability}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="flexible">Flexible</option>
                                    <option value="fulltime">Full Time</option>
                                    <option value="parttime">Part Time</option>
                                    <option value="weekends">Weekends Only</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">TVET Institution (Optional)</label>
                                <input
                                    type="text"
                                    name="tvetInstitution"
                                    value={formData.tvetInstitution}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g., Technical Training Institute"
                                />
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-700 mb-4">Skills & Expertise</label>
                            <div className="relative">
                                <div className="flex gap-2 mb-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                            onFocus={() => setShowSkillSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Add a skill (e.g., Plumbing, Electrical)"
                                        />
                                        {showSkillSuggestions && newSkill && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                                                {skillSuggestions
                                                    .filter(skill => 
                                                        skill.toLowerCase().includes(newSkill.toLowerCase()) && 
                                                        !formData.skills?.includes(skill)
                                                    )
                                                    .slice(0, 5)
                                                    .map((skill, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => {
                                                                setNewSkill(skill);
                                                                addSkill();
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                                        >
                                                            {skill}
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={addSkill}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills?.map((skill, idx) => (
                                    <span key={idx} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                        {skill}
                                        <button
                                            onClick={() => removeSkill(skill)}
                                            className="text-primary-600 hover:text-primary-800 font-bold text-xs"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            {(!formData.skills || formData.skills.length === 0) && (
                                <p className="text-sm text-gray-500 mt-2">Add your skills to showcase your expertise</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">About You</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Tell clients about yourself, your experience, and why you're great at what you do..."
                            />
                        </div>

                        {/* Reason for Joining (Optional) */}
                        <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Why are you joining? (Optional)</label>
                            <textarea
                                name="reasonForJoining"
                                value={formData.reasonForJoining}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Share your motivation for joining FundiWako..."
                            />
                        </div>                    </div>                    </div>
                )}
            </div>
        </div>
    );
}
