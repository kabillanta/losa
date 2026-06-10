"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, Phone } from "lucide-react";

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-sm font-medium"
      >
        <HelpCircle size={16} />
        <span className="hidden sm:inline">Help</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-onyx mb-3 border-b border-gray-100 pb-2">
            Support Contacts
          </h3>

          <div className="flex flex-col gap-3">
            <a
              href="tel:+919787438210"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-gold-dark transition-colors group"
            >
              <div className="bg-gray-50 p-1.5 rounded-md group-hover:bg-gold/10">
                <Phone size={14} />
              </div>
              <p className="font-medium text-onyx">+91 97874 38210</p>
            </a>

            <a
              href="tel:+918122147203"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-gold-dark transition-colors group"
            >
              <div className="bg-gray-50 p-1.5 rounded-md group-hover:bg-gold/10">
                <Phone size={14} />
              </div>
              <p className="font-medium text-onyx">+91 81221 47203</p>
            </a>

            <a
              href="tel:+918015585587"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-gold-dark transition-colors group"
            >
              <div className="bg-gray-50 p-1.5 rounded-md group-hover:bg-gold/10">
                <Phone size={14} />
              </div>
              <p className="font-medium text-onyx">+91 80155 85587</p>
            </a>

            <div className="h-px bg-gray-100 my-1"></div>

            <a
              href="mailto:thetvslosa@gmail.com"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-gold-dark transition-colors group"
            >
              <div className="bg-gray-50 p-1.5 rounded-md group-hover:bg-gold/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <p className="font-medium text-onyx">thetvslosa@gmail.com</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
