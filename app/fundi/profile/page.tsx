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

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-gray-900 mb-2">
                                Welcome, {displayData?.name}!
                            </h1>
                            <p className="text-lg text-gray-600">
                                Manage Your Fundi Profile
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {!isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                        setFormData(profileData || formData);
                                    }}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    Edit Profile
                                </button>
                            )}
                            {isEditing && (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveProfile}
                                        disabled={saving}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => signOut()}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {!isEditing ? (
                    // View Mode
                    <>
                        {/* Profile Header with Photo */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
                            <div className="flex items-start gap-8">
                                <div className="flex-shrink-0">
                                    {displayData?.photoURL ? (
                                        <img
                                            src={displayData.photoURL}
                                            alt={displayData.name}
                                            className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center border-4 border-primary-100">
                                            <span className="text-4xl">👤</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">{displayData?.name}</h2>
                                    <p className="text-gray-600 mb-4">{displayData?.skill}</p>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${displayData?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {displayData?.isVerified ? '✓ Verified' : '⏳ Pending Review'}
                                        </span>
                                        <span className="text-sm text-gray-600">{displayData?.experience}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Account Status</h2>
                                    <p className="text-gray-600">
                                        {displayData?.isVerified ? '✓ Your account is verified' : '⏳ Waiting for verification'}
                                    </p>
                                </div>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${displayData?.isVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                    {displayData?.isVerified ? '✓' : '⌛'}
                                </div>
                            </div>
                        </div>

                        {/* Profile Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {/* Personal Info Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Personal Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Name</p>
                                        <p className="text-gray-900 font-medium">{displayData?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="text-gray-900 font-medium">{displayData?.email || 'N/A'}</p>
                                    </div>                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                                        <p className="text-gray-900 font-medium">{displayData?.phone || 'N/A'}</p>
                                    </div>                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                                        <p className="text-gray-900 font-medium">{displayData?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Info Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Professional Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Primary Skill</p>
                                        <p className="text-gray-900 font-medium">{displayData?.skill || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Experience</p>
                                        <p className="text-gray-900 font-medium">{displayData?.experience || 'Not specified'}</p>
                                    </div>
                                    <div>
                                    <p className="text-sm text-gray-500 mb-1">TVET Institution</p>
                                    <p className="text-gray-900 font-medium">{displayData?.tvetInstitution || 'Not specified'}</p>
                                </div>
                                <div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Neighborhood</p>
                                        <p className="text-gray-900 font-medium">{displayData?.neighborhood || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Availability</p>
                                        <p className="text-gray-900 font-medium capitalize">{displayData?.availability || 'flexible'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Skills</h2>
                                <div className="space-y-3">
                                    {displayData?.skills && displayData.skills.length > 0 ? (
                                        displayData.skills.map((skill, idx) => (
                                            <span key={idx} className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No skills added yet</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description Card */}
                        {displayData?.description && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
                                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">About You</h2>
                                <p className="text-gray-700">{displayData.description}</p>
                            </div>
                        )}
                    </>
                ) : (
                    // Edit Mode
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8">Edit Your Profile</h2>
                        
                        {/* Profile Photo Section */}
                        <div className="mb-8 pb-8 border-b border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-4">Profile Photo</label>
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0">
                                    {photoPreview || displayData?.photoURL ? (
                                        <img
                                            src={photoPreview || displayData?.photoURL}
                                            alt="Preview"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                                            <span className="text-3xl">📷</span>
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
                            <label className="block text-sm font-medium text-gray-700 mb-4">Additional Skills</label>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Add a skill and press Enter"
                                />
                                <button
                                    onClick={addSkill}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills?.map((skill, idx) => (
                                    <span key={idx} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                        {skill}
                                        <button
                                            onClick={() => removeSkill(skill)}
                                            className="text-primary-600 hover:text-primary-800 font-bold"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
