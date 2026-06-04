"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { setFirebaseSession } from "../actions";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Pass UID to server to set secure cookie and route us correctly
      await setFirebaseSession(user.uid);
    } catch (err: any) {
      console.error(err);
      
      let friendlyError = "We couldn't sign you in with Google. Please try again.";
      
      switch (err.code) {
        case "auth/popup-closed-by-user":
          friendlyError = "Sign-in was cancelled. Feel free to try again when you're ready.";
          break;
        case "auth/network-request-failed":
          friendlyError = "It looks like you're offline. Please check your internet connection and try again.";
          break;
        case "auth/popup-blocked":
          friendlyError = "Your browser blocked the sign-in popup. Please allow popups for this site to continue.";
          break;
        case "auth/unauthorized-domain":
          friendlyError = "This website isn't authorized to use Google Sign-In yet. Please contact the administrator.";
          break;
        case "auth/user-disabled":
          friendlyError = "Your account has been temporarily disabled. Please contact support for help.";
          break;
        case "auth/operation-not-allowed":
          friendlyError = "Google Sign-In is currently disabled on our end. We're working on it!";
          break;
        case "auth/too-many-requests":
          friendlyError = "You've tried signing in too many times. Please take a quick break and try again later.";
          break;
        case "auth/account-exists-with-different-credential":
          friendlyError = "An account already exists with this email address using a different login method.";
          break;
        default:
          if (err.message) {
            // Catch-all: gently strip the technical jargon if we missed the specific code
            friendlyError = err.message.replace(/^Firebase:\s*/i, "").replace(/\s*\(auth\/[^)]+\)\.?$/i, ".");
          }
      }

      setError(friendlyError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gold-50 px-4 relative overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-gold/10 blur-3xl -z-10 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-taupe/10 blur-3xl -z-10 mix-blend-multiply pointer-events-none" />

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-white shadow-2xl shadow-gold/5 text-center relative z-10 animate-slide-up">
        
        <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-onyx mb-3 tracking-tight">School Portal</h1>
        <p className="text-taupe text-sm mb-10 leading-relaxed px-2">Securely sign in with your Google account to manage your students and event registrations.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-slide-up">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-100 text-onyx font-bold py-4 px-6 rounded-2xl hover:border-gold hover:bg-gold-50 hover:shadow-lg hover:shadow-gold/10 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 group"
        >
          {loading ? (
            <Loader2 size={24} className="animate-spin text-gold" />
          ) : (
            <>
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
