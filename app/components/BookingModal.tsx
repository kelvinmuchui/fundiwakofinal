"use client";

import { useState } from "react";

interface BookingModalProps {
  fundiId: string;
  fundiName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ fundiId, fundiName, isOpen, onClose }: BookingModalProps) {
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fundiId,
          serviceType,
          description,
          preferredDate,
          preferredTime,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking');
      }

      setIsSuccess(true);
      // Reset form
      setServiceType("");
      setDescription("");
      setPreferredDate("");
      setPreferredTime("");
      setLocation("");
      
      // Auto close after 3 seconds on success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden max-w-xl w-full max-h-[90vh] flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        
        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl animate-bounce">
              ✓
            </div>
            <h3 className="text-3xl font-heading font-black text-secondary-900">Request Sent!</h3>
            <p className="text-neutral-500 max-w-sm">
              Your booking request for <span className="font-bold text-secondary-900">{fundiName}</span> has been sent. They will be notified immediately.
            </p>
            <div className="pt-4">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-secondary-900 text-white rounded-2xl font-bold hover:bg-secondary-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-8 pb-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold uppercase rounded-md">Step 2 of 2</span>
                  <h3 className="text-2xl font-heading font-bold text-secondary-900">
                    Book {fundiName}
                  </h3>
                </div>
                <p className="text-neutral-500 text-sm">Fill in the job details to request a quote.</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-neutral-100 text-neutral-400 hover:text-secondary-900 transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">
                    What needs to be done?
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-5 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-secondary-900"
                    required
                  >
                    <option value="">Select Service Type</option>
                    <option value="repair">Maintenance & Repair</option>
                    <option value="installation">New Installation</option>
                    <option value="consultation">Site Visit / Consultation</option>
                    <option value="emergency">Emergency Service</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">
                    Describe the issue
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., My kitchen sink is leaking and needs a pipe replacement..."
                    className="w-full px-5 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-secondary-900 min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-5 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-secondary-900"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">
                    Time Preference
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-5 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-secondary-900"
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="morning">Morning (8AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 5PM)</option>
                    <option value="evening">Evening (5PM - 8PM)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">
                    Job Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Estate, House Number, or City"
                    className="w-full px-5 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-secondary-900"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 px-6 border-2 border-neutral-100 text-neutral-500 rounded-2xl hover:bg-neutral-50 transition-all font-bold"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 px-6 bg-primary-600 text-white rounded-2xl font-heading font-black text-lg hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Send Request</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
