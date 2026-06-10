"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
// import LiquidEther from "@/components/LiquidEther";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-50 relative pb-20">
      {/* LiquidEther Interactive Background */}
      {/* <div className="absolute inset-0 z-0 opacity-40">
        <LiquidEther
          colors={["#D4B018", "#B59410", "#8D7666"]}
          mouseForce={20}
          cursorSize={100}
          isViscous={true}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div> */}

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 pt-12 md:pt-24 relative z-10">
        {/* Split Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold-dark font-semibold text-sm mb-6 border border-gold/20">
              ✨ Registration Now Open
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-onyx tracking-tight leading-[1.1] mb-6">
              Inter-School <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-taupe">
                Championship
              </span>
            </h1>

            <p className="text-taupe text-lg md:text-xl max-w-xl leading-relaxed mb-10">
              Welcome to the official portal. Create an account for your school
              to easily manage participating teams, assign students to events,
              and generate your entry passes.
            </p>

            <Link
              href="/auth/login"
              className="w-full sm:w-auto bg-onyx text-white font-semibold py-4 px-8 rounded-xl hover:bg-black hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-onyx/20 group"
            >
              <UserPlus
                size={20}
                className="group-hover:rotate-12 transition-transform"
              />
              Register / Login with Google
            </Link>
          </div>

          {/* Right: Masonry Grid */}
          <div
            className="grid grid-cols-2 gap-4 md:gap-6 animate-slide-up w-full max-w-lg mx-auto lg:max-w-none"
            style={{ animationDelay: "150ms" }}
          >
            {/* Column 1 (Staggered Down) */}
            <div className="flex flex-col gap-4 md:gap-6 pt-12">
              <div className="rounded-3xl overflow-hidden shadow-2xl relative group h-56 md:h-72">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                <img
                  src="/1.JPG"
                  alt="Students"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl relative group h-48 md:h-64">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                <img
                  src="/2.JPG"
                  alt="Science Expo"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Column 2 (Starts Higher) */}
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="rounded-3xl overflow-hidden shadow-2xl relative group h-64 md:h-80">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                <img
                  src="/3.JPG"
                  alt="Performance"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl relative group h-56 md:h-72">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                <img
                  src="/4.JPG"
                  alt="Audience"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Cards (Glassmorphism) */}
        <div
          className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-slide-up"
          style={{ animationDelay: "300ms" }}
        >
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-gold to-gold-light text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold shadow-lg shadow-gold/30">
              1
            </div>
            <h3 className="text-xl font-bold text-onyx mb-3">Create Profile</h3>
            <p className="text-taupe leading-relaxed">
              Sign in and provide your basic school details to instantly unlock
              access to the management dashboard.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-taupe to-taupe-light text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold shadow-lg shadow-taupe/30">
              2
            </div>
            <h3 className="text-xl font-bold text-onyx mb-3">Add Students</h3>
            <p className="text-taupe leading-relaxed">
              Select events from the categorized list and securely assign your
              students into the required team sizes.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-onyx to-onyx-light text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold shadow-lg shadow-onyx/30">
              3
            </div>
            <h3 className="text-xl font-bold text-onyx mb-3">Get Your Pass</h3>
            <p className="text-taupe leading-relaxed">
              Once finished, generate a custom QR Code for your school to skip
              the registration lines on event day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
