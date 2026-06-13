"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, List, Search, ChevronRight, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const QRScanner = dynamic(
  () => import("./QRScanner").then((mod) => mod.QRScanner),
  { 
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-taupe">
        <Loader2 className="animate-spin" size={24} />
        <span className="text-sm">Loading scanner...</span>
      </div>
    )
  }
);

type School = {
  id: string;
  name: string;
  teacher_name: string | null;
  qr_code_id: string;
};

export function SchoolSelector({ initialSchools }: { initialSchools: School[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"scan" | "select">("scan");
  const [search, setSearch] = useState("");

  const filteredSchools = initialSchools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.teacher_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSchoolSelect = (qrCodeId: string) => {
    router.push(`/school/${qrCodeId}`);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Mode toggle */}
      <div className="flex bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setMode("scan")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
            mode === "scan"
              ? "bg-white text-onyx shadow-sm"
              : "text-taupe hover:text-onyx"
          }`}
        >
          <QrCode size={16} className={mode === "scan" ? "text-gold" : ""} />
          Scan QR
        </button>
        <button
          onClick={() => setMode("select")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
            mode === "select"
              ? "bg-white text-onyx shadow-sm"
              : "text-taupe hover:text-onyx"
          }`}
        >
          <List size={16} className={mode === "select" ? "text-gold" : ""} />
          Select School
        </button>
      </div>

      {/* Content area */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 lg:p-6">
        {mode === "scan" ? (
          <div className="flex flex-col items-center gap-5 animate-slide-up">
            <p className="text-sm text-taupe text-center max-w-[240px]">
              Position the master QR code within the frame.
            </p>
            <div className="w-full max-w-xs bg-gray-50 rounded-lg border border-gray-200 p-2">
              <QRScanner onScan={handleSchoolSelect} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe" size={18} />
              <input
                type="text"
                placeholder="Search school or teacher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-onyx placeholder:text-taupe/50 focus:outline-none focus:border-onyx transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
              {filteredSchools.length === 0 ? (
                <div className="py-12 text-center text-taupe">
                  <p className="text-sm">No schools found.</p>
                </div>
              ) : (
                filteredSchools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => handleSchoolSelect(school.qr_code_id)}
                    className="flex items-center justify-between text-left px-4 py-3.5 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div>
                      <div className="font-medium text-onyx text-[15px]">
                        {school.name}
                      </div>
                      {school.teacher_name && (
                        <div className="text-sm text-taupe mt-0.5">
                          {school.teacher_name}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-taupe transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
