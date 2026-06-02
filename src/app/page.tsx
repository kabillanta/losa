"use client";

import Link from "next/link";
import { ArrowRight, UserPlus, LogIn } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 overflow-hidden bg-gray-50">
      <div className="w-full max-w-5xl">
        <div className="mb-12 text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold-dark font-semibold text-sm mb-6">
            ✨ Registration Now Open
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-onyx tracking-tight leading-tight">
            Inter-School <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-onyx to-gray-500">
              Championship Registration
            </span>
          </h1>
          <p className="text-taupe mt-6 text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to the official registration portal. Create an account for your school to easily manage your participating teams, add students to events, and generate your entry pass.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Link 
            href="/auth/login" 
            className="w-full sm:w-auto bg-onyx text-white font-semibold py-4 px-8 rounded-xl hover:bg-black transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-onyx/20"
          >
            <UserPlus size={20} />
            Register / Login with Google
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="p-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h3 className="text-lg font-bold text-onyx mb-2">Create Profile</h3>
            <p className="text-sm text-taupe">Sign up with your school details to get access to the dashboard.</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h3 className="text-lg font-bold text-onyx mb-2">Add Students</h3>
            <p className="text-sm text-taupe">Select events and securely assign your students into the correct team sizes.</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h3 className="text-lg font-bold text-onyx mb-2">Get Your Pass</h3>
            <p className="text-sm text-taupe">Receive a custom QR Code for your school to skip the line on event day.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
