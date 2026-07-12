"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // July 13th of the current year (or next year if passed)
    const now = new Date();
    let year = now.getFullYear();
    let deadline = new Date(year, 6, 18, 23, 59, 59); // Month is 0-indexed (6 = July)

    if (now > deadline) {
      deadline = new Date(year + 1, 6, 18, 23, 59, 59);
    }

    const calculateTimeLeft = () => {
      const difference = deadline.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) return null; // Prevent hydration mismatch

  return (
    <div className="hidden sm:flex items-center gap-3 lg:gap-4 px-4 py-1.5 rounded-lg bg-gray-100 border border-gray-200 shadow-sm text-onyx">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold hidden lg:inline tracking-wide text-taupe">
          Registration ends in
        </span>
      </div>

      <div className="w-px h-5 bg-gray-300 hidden md:block"></div>

      <div className="flex gap-3 lg:gap-4 text-sm font-bold tabular-nums text-onyx leading-none">
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span>{timeLeft.days.toString().padStart(2, "0")}</span>
          <span className="text-[8px] uppercase text-gray-500 font-sans tracking-wider">
            Days
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span>{timeLeft.hours.toString().padStart(2, "0")}</span>
          <span className="text-[8px] uppercase text-gray-500 font-sans tracking-wider">
            Hrs
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span>{timeLeft.minutes.toString().padStart(2, "0")}</span>
          <span className="text-[8px] uppercase text-gray-500 font-sans tracking-wider">
            Min
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-0.5 w-5">
          <span>{timeLeft.seconds.toString().padStart(2, "0")}</span>
          <span className="text-[8px] uppercase text-gray-500 font-sans tracking-wider">
            Sec
          </span>
        </div>
      </div>
    </div>
  );
}
