"use client";

import { useState, useMemo } from "react";
import { Plus, X, Loader2, AlertCircle } from "lucide-react";
import { adminAddTeam, StudentInfo } from "./adminActions";

interface EventConfig {
  name: string;
  slug: string;
  category: string;
  min_size: number;
  max_size: number;
}

interface AdminAddTeamModalProps {
  schoolId: string;
  schoolName: string;
  eventsConfig: EventConfig[];
}

const emptyStudent: StudentInfo = { name: "", className: "", section: "", admissionNumber: "" };

const getAllowedClasses = (category: string) => {
  if (category.includes("Tiny Tots")) return ["Pre-KG", "LKG", "UKG"];
  if (category.includes("Energetic Kids")) return ["I", "II", "III"];
  if (category.includes("Young Visionaries")) return ["IV", "V", "VI"];
  if (category.includes("Emerging Stars")) return ["VII", "VIII", "IX"];
  if (category.includes("Teen Trailblazers")) return ["X", "XI", "XII"];
  return ["Pre-KG", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
};

export default function AdminAddTeamModal({
  schoolId,
  schoolName,
  eventsConfig
}: AdminAddTeamModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Selections
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>("");

  const categories = useMemo(() => {
    const cats = new Set(eventsConfig.map(e => e.category));
    return Array.from(cats);
  }, [eventsConfig]);

  const availableEvents = useMemo(() => {
    return eventsConfig.filter(e => e.category === selectedCategory);
  }, [selectedCategory, eventsConfig]);

  const selectedEvent = useMemo(() => {
    return availableEvents.find(e => e.slug === selectedEventSlug) || null;
  }, [selectedEventSlug, availableEvents]);

  const isTeacherEvent = selectedCategory.includes("Teacher");
  const minSize = selectedEvent?.min_size || 1;
  const maxSize = selectedEvent?.max_size || 1;
  const allowedClasses = getAllowedClasses(selectedCategory);

  const [students, setStudents] = useState<StudentInfo[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset students when event changes
  useMemo(() => {
    if (selectedEvent) {
      setStudents(Array(selectedEvent.max_size).fill(null).map(() => ({ ...emptyStudent, className: allowedClasses[0] })));
    }
  }, [selectedEvent, selectedCategory]);

  const handleFieldChange = (index: number, field: keyof StudentInfo, value: string) => {
    const newStudents = [...students];
    newStudents[index] = { ...newStudents[index], [field]: value };
    
    if (field === "name" && allowedClasses.length === 1 && !newStudents[index].className) {
      newStudents[index].className = allowedClasses[0];
    }
    
    setStudents(newStudents);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setLoading(true);
    setError(null);

    const validStudents = students.filter(s => 
      isTeacherEvent 
        ? s.name.trim().length > 0
        : s.name.trim().length > 0 && s.className.trim().length > 0 && s.section.trim().length > 0 && s.admissionNumber.trim().length > 0
    );

    if (validStudents.length < minSize) {
      setError(`This event requires at least ${minSize} participant(s).`);
      setLoading(false);
      return;
    }

    const res = await adminAddTeam(schoolId, selectedEvent.slug, students, isTeacherEvent);

    if (res?.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
      setSelectedCategory("");
      setSelectedEventSlug("");
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:text-primary-800 transition-colors p-2 bg-primary-50 hover:bg-primary-100 rounded-lg w-fit"
      >
        <Plus size={16} /> Register for New Event
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-onyx">Register New Event</h2>
            <p className="text-sm text-taupe">{schoolName}</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-blue-800 uppercase">1. Select Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedEventSlug("");
                }}
                className="px-3 py-2.5 border border-blue-200 rounded-lg text-sm bg-white"
                required
              >
                <option value="" disabled>-- Choose Category --</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-blue-800 uppercase">2. Select Event</label>
              <select 
                value={selectedEventSlug} 
                onChange={(e) => setSelectedEventSlug(e.target.value)}
                className="px-3 py-2.5 border border-blue-200 rounded-lg text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
                required
                disabled={!selectedCategory}
              >
                <option value="" disabled>-- Choose Event --</option>
                {availableEvents.map(evt => (
                  <option key={evt.slug} value={evt.slug}>{evt.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedEvent && (
            <div className="space-y-4">
              <h3 className="font-bold text-onyx border-b border-gray-100 pb-2">Participant Details</h3>
              {students.map((student, index) => {
                const isRequired = index < minSize;
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 items-center">
                    <div className="col-span-1 flex items-center gap-2 font-bold text-gray-500">
                      <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      {isRequired && <span className="text-red-500 text-xs">*</span>}
                    </div>
                    
                    <div className={`flex flex-col gap-1 ${isTeacherEvent ? 'col-span-11' : 'col-span-4'}`}>
                      <label className="text-xs font-bold text-gray-500 uppercase">{isTeacherEvent ? "Teacher Name" : "Name"}</label>
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Name"
                      />
                    </div>

                    {!isTeacherEvent && (
                      <>
                        <div className="col-span-2 flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Class</label>
                          <select
                            value={student.className}
                            onChange={(e) => handleFieldChange(index, "className", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                          >
                            {allowedClasses.map(cls => (
                              <option key={cls} value={cls}>{cls}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Section</label>
                          <input
                            type="text"
                            value={student.section}
                            onChange={(e) => handleFieldChange(index, "section", e.target.value.toUpperCase())}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="A"
                            maxLength={5}
                          />
                        </div>
                        <div className="col-span-3 flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Admission No</label>
                          <input
                            type="text"
                            value={student.admissionNumber}
                            onChange={(e) => handleFieldChange(index, "admissionNumber", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="ID"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-2 items-start text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 text-taupe font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedEvent}
              className="px-6 py-2.5 bg-onyx text-white font-medium hover:bg-black rounded-xl transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
