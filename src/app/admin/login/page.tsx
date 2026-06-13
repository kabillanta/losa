"use client";

import { Suspense, useState } from "react";
import { login } from "./actions";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/admin";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    // If we get here, it means it didn't redirect (so there was an error)
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      
      <div>
        <label htmlFor="password" className="sr-only">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          required
          placeholder="Enter password"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx/20 focus:border-onyx transition-all"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 font-medium text-center">{error}</p>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-onyx text-white font-medium py-3 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Verifying...
          </>
        ) : (
          "Log In"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-12 animate-slide-up">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
              <Lock size={20} className="text-onyx" />
            </div>
            <h1 className="text-2xl font-bold text-onyx tracking-tight">Admin Login</h1>
            <p className="text-sm text-taupe mt-2">Enter the admin password to access the dashboard.</p>
          </div>

          <Suspense fallback={<div className="flex justify-center py-4"><Loader2 className="animate-spin text-taupe" /></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
