// Metadata cannot be exported from a Client Component

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BecomeAFundi() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        idNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        skill: "",
        experience: "",
        tvetInstitution: "",
        description: "",
        location: "", // Represents Base County/City in UI
        neighborhood: "",
        certificates: [] as File[],
        reasonForJoining: "",
        availability: "flexible",
        skills: [] as string[],
    });
    const [currentSkillInput, setCurrentSkillInput] = useState("");

    const handleSkillAdd = () => {
        if (currentSkillInput.trim() && !formData.skills.includes(currentSkillInput.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, currentSkillInput.trim()]
            }));
            setCurrentSkillInput("");
        }
    };

    const handleSkillRemove = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove)
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;
        if (files && name === 'certificates') {
            setFormData(prev => ({ ...prev, certificates: Array.from(files) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setSubmitStatus({
                type: 'error',
                message: 'Passwords do not match'
            });
            setIsSubmitting(false);
            return;
        }

        // Validate password strength
        if (formData.password.length < 6) {
            setSubmitStatus({
                type: 'error',
                message: 'Password must be at least 6 characters long'
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const formDataToSend = new FormData();

            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'certificates') {
                    (value as File[]).forEach((file) => {
                        formDataToSend.append(`certificates`, file);
                    });
                } else if (key === 'skills') {
                    (value as string[]).forEach((skill) => {
                        formDataToSend.append(`skills`, skill);
                    });
                } else if (key !== 'confirmPassword') {
                    formDataToSend.append(key, value as string);
                }
            });

            // Add role as 'fundi' since this is the become-a-fundi form
            formDataToSend.append('role', 'fundi');

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                body: formDataToSend
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create account');
            }

            setSubmitStatus({
                type: 'success',
                message: 'Your account has been created successfully! Redirecting to your profile...'
            });

            // Clear form on success
            setFormData({
                name: "", phone: "", idNumber: "", email: "", password: "", confirmPassword: "",
                skill: "", experience: "", tvetInstitution: "", description: "", location: "", neighborhood: "",
                certificates: [], reasonForJoining: "", availability: "flexible", skills: []
            });

            // Redirect to fundi profile page after 1 second
            setTimeout(() => {
                router.push('/fundi/profile');
            }, 1000);

        } catch (error: any) {
            setSubmitStatus({
                type: 'error',
                message: error.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 pt-32 pb-20">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-96 gradient-primary -z-10" />
            <div className="absolute top-0 left-0 w-full h-96 bg-hero-pattern opacity-10 mix-blend-overlay -z-10" />

            <div className="container-max section-padding">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 text-white">
                        <h1 className="text-4xl md:text-5xl font-heading text-black font-extrabold mb-4">
                            Join FundiWako Today
                        </h1>
                        <p className="text-lg text-white/90 max-w-2xl mx-auto">
                            Ready to grow your business? Apply to become a verified artisan on our
                            platform and connect with thousands of customers needing your skills.
                        </p>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-premium border border-neutral-100 relative">
                        {submitStatus?.type === 'success' ? (
                            <div className="text-center py-12 animate-fade-in">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-heading font-bold text-secondary-500 mb-4">
                                    Application Received!
                                </h2>
                                <p className="text-neutral-600 max-w-lg mx-auto mb-8">
                                    {submitStatus.message}
                                </p>
                                <button 
                                    onClick={() => setSubmitStatus(null)}
                                    className="btn-secondary"
                                >
                                    Submit Another Application
                                </button>
                            </div>
                        ) : (
                        <>
                            <div className="mb-10 text-center">
                                <h2 className="text-2xl font-heading font-bold text-secondary-500">
                                    Application Form
                                </h2>
                                <p className="text-neutral-500 mt-2 text-sm">
                                    Please provide accurate information. Our vetting team will contact
                                    you within 48 hours.
                                </p>
                            </div>

                            {submitStatus?.type === 'error' && (
                                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {submitStatus.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Personal Info */}
                                <div>
                                    <h3 className="text-lg font-heading font-semibold text-secondary-500 mb-4 border-b border-neutral-100 pb-2">
                                        1. Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white"
                                                placeholder="e.g. John Doe"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white"
                                                placeholder="e.g. 0712 345 678"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                National ID / Passport Number *
                                            </label>
                                            <input
                                                type="text"
                                                name="idNumber"
                                                value={formData.idNumber}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white"
                                                placeholder="Enter ID Number"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white"
                                                placeholder="e.g. john@example.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Password *
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white"
                                                placeholder="Create a strong password"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Confirm Password *
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white"
                                                placeholder="Confirm your password"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Info */}
                                <div>
                                    <h3 className="text-lg font-heading font-semibold text-secondary-500 mb-4 border-b border-neutral-100 pb-2">
                                        2. Professional Info
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Primary Service Specialty *
                                            </label>
                                            <select
                                                name="skill"
                                                value={formData.skill}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white text-neutral-700 appearance-none"
                                                required
                                            >
                                                <option value="">Select a service...</option>
                                                <option value="Plumbing">Plumbing</option>
                                                <option value="Electrical">Electrical</option>
                                                <option value="Carpentry">Carpentry</option>
                                                <option value="Painting">Painting</option>
                                                <option value="Masonry">Masonry</option>
                                                <option value="Cleaning">Cleaning</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Additional Skills (Optional)
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={currentSkillInput}
                                                    onChange={(e) => setCurrentSkillInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleSkillAdd();
                                                        }
                                                    }}
                                                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white text-sm"
                                                    placeholder="Type a skill and press Enter"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSkillAdd}
                                                    className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-medium transition-colors text-sm"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            {formData.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {formData.skills.map((skill, index) => (
                                                        <span 
                                                            key={index}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-100"
                                                        >
                                                            {skill}
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleSkillRemove(skill)}
                                                                className="hover:text-primary-900 focus:outline-none"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Years of Experience *
                                            </label>
                                            <select
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white text-neutral-700 appearance-none"
                                                required
                                            >
                                                <option value="">Select experience...</option>
                                                <option value="0-2">0 - 2 years</option>
                                                <option value="3-5">3 - 5 years</option>
                                                <option value="5-10">5 - 10 years</option>
                                                <option value="10+">10+ years</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                TVET Institution Attended (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                name="tvetInstitution"
                                                value={formData.tvetInstitution}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white"
                                                placeholder="e.g. Kenya Technical Trainers College (KTTC)"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Upload Certificates (Optional)
                                            </label>
                                            <input
                                                type="file"
                                                name="certificates"
                                                onChange={handleChange}
                                                multiple
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                            />
                                            <p className="text-xs text-neutral-500 mt-1">
                                                Upload your certificates, licenses, or qualifications (PDF, JPG, PNG - Max 5MB each)
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Brief Description of Services *
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white resize-none h-24"
                                                placeholder="Describe the services you provide and your specialties"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Location Info */}
                                <div>
                                    <h3 className="text-lg font-heading font-semibold text-secondary-500 mb-4 border-b border-neutral-100 pb-2">
                                        3. Location & Availability
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Base County/City *
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white"
                                                placeholder="e.g. Nairobi"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Specific Neighborhood *
                                            </label>
                                            <input
                                                type="text"
                                                name="neighborhood"
                                                value={formData.neighborhood}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white"
                                                placeholder="e.g. Kilimani"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Availability *
                                            </label>
                                            <select
                                                name="availability"
                                                value={formData.availability}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white text-neutral-700 appearance-none"
                                                required
                                            >
                                                <option value="flexible">Flexible</option>
                                                <option value="fulltime">Full-time</option>
                                                <option value="parttime">Part-time</option>
                                                <option value="weekends">Weekends Only</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div>
                                    <h3 className="text-lg font-heading font-semibold text-secondary-500 mb-4 border-b border-neutral-100 pb-2">
                                        4. Additional Information
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Why are you joining FundiWako? *
                                            </label>
                                            <textarea
                                                name="reasonForJoining"
                                                value={formData.reasonForJoining}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-neutral-50 focus:bg-white resize-none h-20"
                                                placeholder="Tell us why you want to join our platform and what you hope to achieve"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Terms & Submit */}
                                <div className="pt-6 border-t border-neutral-100">
                                    <label className="flex items-start gap-3 cursor-pointer mb-8">
                                        <input
                                            type="checkbox"
                                            className="mt-1 w-5 h-5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                                            required
                                        />
                                        <span className="text-sm text-neutral-600">
                                            I agree to the{" "}
                                            <a href="#" className="text-primary-500 hover:underline">
                                                Terms of Service
                                            </a>{" "}
                                            and{" "}
                                            <a href="#" className="text-primary-500 hover:underline">
                                                Privacy Policy
                                            </a>
                                            . I confirm that all the information provided is accurate and I consent
                                            to a background check by the FundiWako vetting team.
                                        </span>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full btn-primary py-4 text-lg shadow-xl flex justify-center items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : "Submit Application"}
                                    </button>
                                </div>
                            </form>
                        </>
                        )}
                    </div>

                    {/* Trust badges footer */}
                    <div className="mt-8 flex justify-center items-center gap-6 text-neutral-400 text-sm">
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secure Application
                        </span>
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Verified Platform
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
}
