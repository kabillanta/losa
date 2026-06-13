"use client";

import { useState } from "react";
import { completeProfile } from "../actions";
import { Loader2 } from "lucide-react";

export default function CompleteProfilePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    const result = await completeProfile(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-onyx mb-2">Complete Your Profile</h1>
        <p className="text-taupe text-sm mb-6">Since this is your first time signing in, please provide your school details.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-onyx mb-1.5">School Name *</label>
            <input 
              type="text" 
              name="schoolName" 
              required 
              pattern="[A-Za-z\s\-']+"
              title="Only letters and spaces are allowed. No numbers."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx/20 focus:border-onyx transition-all text-sm"
              placeholder="e.g. St Josephs High School"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-onyx mb-1.5">Teacher / Coordinator Name *</label>
            <input 
              type="text" 
              name="teacherName" 
              required 
              pattern="[A-Za-z\s\-']+"
              title="Only letters and spaces are allowed. No numbers."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx/20 focus:border-onyx transition-all text-sm"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-onyx mb-1.5">Mobile Number *</label>
            <input 
              type="tel" 
              name="phoneNumber" 
              required 
              pattern="[0-9]{10}"
              maxLength={10}
              minLength={10}
              title="Please enter exactly 10 digits"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx/20 focus:border-onyx transition-all text-sm"
              placeholder="e.g. 9876543210"
              onInput={(e) => {
                // Ensure only numbers are typed
                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-onyx mb-1.5">Email Address *</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx/20 focus:border-onyx transition-all text-sm"
              placeholder="e.g. teacher@school.edu"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-onyx text-white font-medium py-3 px-4 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
