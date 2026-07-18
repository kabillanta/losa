"use client";

import { useState } from "react";
import { Plus, X, Loader2, AlertCircle } from "lucide-react";
import { adminAddSchool } from "./adminActions";

export default function AdminAddSchoolModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await adminAddSchool(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
      >
        <Plus size={16} /> Add New School
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-onyx">Add New School</h2>
            <p className="text-sm text-taupe">Manually register an offline school.</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-onyx">School Name</label>
            <input
              type="text"
              name="schoolName"
              className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="e.g. St. Joseph's Academy"
              pattern="[A-Za-z\s\-']*[A-Za-z][A-Za-z\s\-']*"
              title="Must contain at least one letter and no numbers."
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-onyx">Teacher / In-Charge Name</label>
            <input
              type="text"
              name="teacherName"
              className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="e.g. Mrs. Smith"
              pattern="[A-Za-z\s\-']*[A-Za-z][A-Za-z\s\-']*"
              title="Must contain at least one letter and no numbers."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-onyx">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="10 digit number"
                pattern="[0-9]{10}"
                title="Must be exactly 10 digits."
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-onyx">Email Address</label>
              <input
                type="email"
                name="email"
                className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="school@example.com"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-2 items-start text-sm mt-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 text-taupe font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-onyx text-white font-medium hover:bg-black rounded-xl transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Save School"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
