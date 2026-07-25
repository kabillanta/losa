"use client";

import { useState, useEffect, useRef } from "react";
import {
  Trophy,
  Medal,
  Award,
  Maximize,
  Minimize,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

type OverallEntry = {
  school: any;
  total: number;
  judges: number;
};

type EventLeaderboard = {
  event: any;
  category: string;
  leaderboard: {
    school: any;
    teamId: string;
    total: number;
    judges: number;
    studentNames: string[];
  }[];
};

const CATEGORY_COLORS: Record<string, string> = {
  "Tiny Tots (Pre-KG, LKG, UKG)": "bg-pink-100 text-pink-800 border-pink-200",
  "Energetic Kids (Classes I-III)": "bg-blue-100 text-blue-800 border-blue-200",
  "Young Visionaries (Classes IV-VI)":
    "bg-green-100 text-green-800 border-green-200",
  "Emerging Stars (Classes VII-IX)":
    "bg-purple-100 text-purple-800 border-purple-200",
  "Teen Trailblazers (Classes X-XII)":
    "bg-orange-100 text-orange-800 border-orange-200",
  Uncategorized: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function DisplayEngine({
  overallLeaderboard,
  eventLeaderboards,
  totalEventsCount,
}: {
  overallLeaderboard: OverallEntry[];
  eventLeaderboards: EventLeaderboard[];
  totalEventsCount: number;
}) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const INTERVAL_MS = 10000; // 10 seconds per event
  const UPDATE_RATE = 100; // Update progress bar every 100ms
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the rest of the leaderboard
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || overallLeaderboard.length <= 3) return;

    let animationFrameId: number;
    let scrollPos = 0;

    const scroll = () => {
      // If we can't scroll, just return
      if (el.scrollHeight <= el.clientHeight) {
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }

      scrollPos += 0.5; // Scroll speed

      // Reset if we reach the bottom
      if (scrollPos >= el.scrollHeight - el.clientHeight) {
        scrollPos = 0;
      }

      el.scrollTop = scrollPos;
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [overallLeaderboard]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms
    const refreshTimer = setInterval(() => {
      router.refresh(); // Fetches latest server props without losing client state (rotation)
    }, REFRESH_INTERVAL);

    return () => clearInterval(refreshTimer);
  }, [router]);

  useEffect(() => {
    if (eventLeaderboards.length === 0) return;

    let startTime = Date.now();
    setProgress(0); // Reset progress when event changes

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= INTERVAL_MS) {
        setCurrentEventIndex((idx) => (idx + 1) % eventLeaderboards.length);
      } else {
        setProgress((elapsed / INTERVAL_MS) * 100);
      }
    }, UPDATE_RATE);

    return () => clearInterval(timer);
  }, [eventLeaderboards.length, currentEventIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0)
      return <Trophy className="text-yellow-500 drop-shadow-md" size={40} />;
    if (index === 1)
      return <Medal className="text-gray-400 drop-shadow-md" size={40} />;
    if (index === 2)
      return <Award className="text-amber-600 drop-shadow-md" size={40} />;
    return (
      <span className="text-2xl font-bold text-gray-400 w-10 text-center">
        {index + 1}
      </span>
    );
  };

  const getRankBg = (index: number) => {
    if (index === 0)
      return "bg-gradient-to-r from-yellow-50 to-white border-yellow-200 shadow-md transform scale-[1.02] z-10";
    if (index === 1)
      return "bg-gradient-to-r from-slate-50 to-white border-slate-200 shadow-sm";
    if (index === 2)
      return "bg-gradient-to-r from-orange-50 to-white border-orange-200 shadow-sm";
    return "bg-white border-gray-100 shadow-sm";
  };

  const currentEvent =
    eventLeaderboards[currentEventIndex] || eventLeaderboards[0];

  return (
    <div
      className={`h-screen overflow-hidden bg-gray-50 flex flex-col ${isFullscreen ? "p-6" : "p-4 md:p-8"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-3">
          {!isFullscreen && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-onyx tracking-tight">
            LOSA 2K26 - Live Leaderboard
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <img
            src="/logo.png"
            alt="LOSA Logo"
            className="h-12 w-auto object-contain"
          />
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-taupe hover:text-onyx transition-all shadow-sm"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-onyx text-white p-6 flex items-center shadow-inner">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-gold/20 p-2 rounded-full">
                <Trophy className="text-gold" size={28} />
              </div>
              <h2 className="text-2xl font-bold">Overall Standings</h2>
            </div>
            <div className="text-right bg-black/20 px-4 py-2 rounded-lg border border-white/10">
              <div className="text-xl font-black text-gold tracking-wide">
                {eventLeaderboards.length}{" "}
                <span className="text-gray-400 text-base font-bold">
                  / {totalEventsCount || eventLeaderboards.length}
                </span>
              </div>
              <div className="text-[10px] text-gray-300 uppercase font-bold tracking-wider mt-0.5">
                Events Announced
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-4 flex flex-col space-y-3">
            {overallLeaderboard.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-taupe p-10 text-center">
                <Trophy className="text-gray-300 mb-4" size={48} />
                <p className="text-lg font-medium text-onyx">
                  The battle for the championship has begun!
                </p>
                <p className="text-sm mt-2">
                  Overall standings will appear here once the first scores are
                  tallied.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 shrink-0">
                  <AnimatePresence>
                    {overallLeaderboard.slice(0, 3).map((entry, index) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          type: "spring",
                          bounce: 0.2,
                        }}
                        key={entry.school.id}
                        className={`flex items-center p-4 rounded-xl border transition-all ${getRankBg(index)}`}
                      >
                        <div className="w-14 flex justify-center shrink-0">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1 ml-4">
                          <h3
                            className={`text-2xl ${index === 0 ? "font-bold text-onyx" : "font-semibold text-gray-800"}`}
                          >
                            {entry.school.name}
                          </h3>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {overallLeaderboard.length > 3 && (
                  <div className="flex-1 overflow-hidden relative mt-3">
                    <div
                      className="absolute inset-0 overflow-y-auto custom-scrollbar pb-10 space-y-3"
                      ref={scrollRef}
                    >
                      {overallLeaderboard.slice(3).map((entry, idx) => {
                        const actualIndex = idx + 3;
                        return (
                          <div
                            key={entry.school.id}
                            className={`flex items-center p-3.5 rounded-xl border transition-all ${getRankBg(actualIndex)}`}
                          >
                            <div className="w-14 flex justify-center shrink-0">
                              {getRankIcon(actualIndex)}
                            </div>
                            <div className="flex-1 ml-4">
                              <h3 className="font-semibold text-xl text-gray-700">
                                {entry.school.name}
                              </h3>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="bg-onyx p-3.5 text-center shrink-0 shadow-inner">
            <p className="text-xs md:text-sm text-gold font-bold uppercase tracking-widest">
              * Note: Live standings are for reference. Organizer's decisions
              are final.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: EVENT SPOTLIGHT */}
        <div className="lg:col-span-7 flex flex-col h-full relative">
          {eventLeaderboards.length === 0 ? (
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-taupe text-center p-12">
              <Award className="text-gray-300 mb-6" size={64} />
              <h2 className="text-3xl font-bold text-onyx mb-3">
                Awaiting Event Results
              </h2>
              <p className="text-lg">
                Our judges are currently evaluating the incredible performances.
              </p>
              <p className="text-lg mt-1">
                Get ready to cheer for your team as results will be revealed
                shortly!
              </p>
            </div>
          ) : (
            currentEvent && (
              <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden relative">
                {/* Event Header with Dynamic Color */}
                <div className="p-8 pb-6 border-b border-gray-100 relative overflow-hidden bg-gray-50/50 flex justify-between items-start">
                  <div className="z-10">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border mb-4 shadow-sm ${CATEGORY_COLORS[currentEvent.category] || CATEGORY_COLORS["Uncategorized"]}`}
                    >
                      {currentEvent.category}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-onyx tracking-tight">
                      {currentEvent.event.name}
                    </h2>
                  </div>
                  
                  {/* Background Icon */}
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Trophy size={120} />
                  </div>

                  {/* Navigation Arrows */}
                  {eventLeaderboards.length > 1 && (
                    <div className="flex items-center gap-2 z-10 relative">
                      <button
                        onClick={() => setCurrentEventIndex((idx) => (idx - 1 + eventLeaderboards.length) % eventLeaderboards.length)}
                        className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors shadow-sm text-gray-500 hover:text-onyx"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={() => setCurrentEventIndex((idx) => (idx + 1) % eventLeaderboards.length)}
                        className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors shadow-sm text-gray-500 hover:text-onyx"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Event Leaderboard List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {currentEvent.leaderboard.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-taupe text-center p-10">
                      <p className="text-2xl font-semibold text-onyx">
                        The judges are still finalizing the scores for this
                        event.
                      </p>
                      <p className="text-lg mt-3 text-gray-500">Stay tuned!</p>
                    </div>
                  ) : (
                    currentEvent.leaderboard.map((entry, index) => {
                      // Treat 4th place (index 3) and beyond as 3rd place (index 2) for ties
                      const rankIndex = Math.min(index, 2);
                      return (
                        <div
                          key={`${entry.school.id}-${entry.teamId}`}
                          className={`flex items-center p-5 rounded-2xl border transition-all hover:shadow-md ${getRankBg(rankIndex)}`}
                        >
                          <div className="w-16 flex justify-center shrink-0">
                            {getRankIcon(rankIndex)}
                          </div>
                          <div className="flex-1 ml-5">
                            <h3
                              className={`text-2xl md:text-3xl ${rankIndex === 0 ? "font-bold text-onyx" : "font-semibold text-gray-800"}`}
                            >
                              {entry.school.name}
                            </h3>
                            {entry.studentNames.length > 0 && (
                              <div className="text-lg text-taupe mt-1.5 leading-relaxed">
                                {entry.studentNames.join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Progress Bar for Rotation */}
                <div className="h-1.5 w-full bg-gray-100 absolute bottom-0 left-0">
                  <div
                    className="h-full bg-onyx transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
