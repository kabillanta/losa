"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, UserCheck, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  name: string;
  is_present: boolean;
};

export function Checklist({ schoolId, schoolName, initialStudents, initialLotNumber }: { schoolId: string; schoolName: string; initialStudents: Student[], initialLotNumber?: number | null }) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lotNumber, setLotNumber] = useState<string>("");
  const [lotError, setLotError] = useState<string>("");

  const toggleStudent = (id: string) => {
    setStudents(students.map((s) => (s.id === id ? { ...s, is_present: !s.is_present } : s)));
  };

  const markAllPresent = () => {
    setStudents(students.map((s) => ({ ...s, is_present: true })));
  };

  const markAllAbsent = () => {
    setStudents(students.map((s) => ({ ...s, is_present: false })));
  };

  const presentCount = students.filter((s) => s.is_present).length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updates = students.map((student) => ({
        id: student.id,
        name: student.name,
        school_id: schoolId,
        is_present: student.is_present,
      }));

      if (!initialLotNumber && lotNumber) {
        const { error: schoolError } = await supabase
          .from("schools")
          .update({ lot_number: parseInt(lotNumber, 10) })
          .eq("id", schoolId);
          
        if (schoolError) {
          if (schoolError.code === "23505") { // Unique violation
            setLotError("This Lot Number is already assigned to another school!");
            setIsSubmitting(false);
            return;
          }
          throw schoolError;
        }
      }

      const { error } = await supabase.from("students").upsert(updates);
      if (error) throw error;

      router.push("/success");
    } catch (error) {
      console.error("Failed to submit attendance. Saving to offline queue:", error);
      // Fallback: Save to offline queue
      const { saveToQueue } = await import("@/lib/sync");
      
      const updates = students.map((student) => ({
        id: student.id,
        name: student.name,
        school_id: schoolId,
        is_present: student.is_present,
      }));
      
      saveToQueue(schoolId, schoolName, updates, lotNumber ? parseInt(lotNumber, 10) : null);
      
      // Dispatch an event so the header component knows immediately
      window.dispatchEvent(new Event("attendance_queued"));
      
      router.push("/success?offline=true");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 sticky top-20 bg-gray-50 py-3 -mt-3 z-10">
        
        {/* Lot Number UI */}
        {!initialLotNumber && (
          <div className="flex items-center gap-2 mr-2 relative">
             <label className="text-sm font-semibold text-onyx whitespace-nowrap">Lot Number:</label>
             <input 
               type="number" 
               value={lotNumber} 
               onChange={(e) => { setLotNumber(e.target.value); setLotError(""); }}
               className={`w-20 px-3 py-2 bg-white border ${lotError ? "border-red-500" : "border-gray-300"} rounded-lg text-sm outline-none focus:border-gold`}
               placeholder="e.g. 1"
               min="1"
               max="34"
               onBlur={(e) => {
                 const val = parseInt(e.target.value, 10);
                 if (val > 34) {
                   setLotNumber("34");
                   setLotError("Max lot number is 34");
                 }
               }}
             />
             {lotError && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 whitespace-nowrap font-medium">{lotError}</span>}
          </div>
        )}
        {initialLotNumber && (
          <div className="flex items-center gap-2 mr-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
             <label className="text-sm font-semibold text-taupe whitespace-nowrap">Lot:</label>
             <span className="font-bold text-onyx">{initialLotNumber}</span>
          </div>
        )}

        <button
          onClick={markAllPresent}
          className="inline-flex items-center gap-2 text-sm font-medium text-onyx bg-white border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <UserCheck size={16} className="text-gold" />
          Mark all present
        </button>
        <button
          onClick={markAllAbsent}
          className="inline-flex items-center gap-2 text-sm font-medium text-taupe bg-white border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        <span className="text-sm text-taupe tabular-nums ml-auto">
          {presentCount}/{students.length} present
        </span>
      </div>

      {/* Student grid */}
      {students.length === 0 ? (
        <div className="py-16 text-center text-taupe">
          <p>No students registered for this school.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 animate-slide-up">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => toggleStudent(student.id)}
              className={`flex items-center gap-3 text-left px-4 py-3.5 rounded-lg border transition-colors ${
                student.is_present
                  ? "bg-gold-50 border-gold/25 text-onyx"
                  : "bg-white border-gray-200 text-taupe hover:border-gray-300"
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded border flex-none transition-colors ${
                  student.is_present
                    ? "bg-gold border-gold text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {student.is_present && <Check size={12} strokeWidth={3} />}
              </span>
              <span className="text-sm font-medium truncate">{student.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Submit — sticky bottom */}
      <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 to-gray-50/0 pt-6 pb-4 mt-auto">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || students.length === 0}
          className="w-full sm:w-auto bg-onyx text-white font-medium py-3.5 px-10 rounded-lg hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 sm:ml-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Submitting...
            </>
          ) : (
            "Submit attendance"
          )}
        </button>
      </div>
    </div>
  );
}
