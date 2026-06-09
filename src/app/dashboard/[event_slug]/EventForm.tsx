"use client";

import { useState } from "react";
import { saveEventEnrollments, StudentInfo } from "../actions";
import { Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";

interface EventFormProps {
  eventSlug: string;
  minSize: number;
  maxSize: number;
  maxTeams: number;
  initialTeams: StudentInfo[][];
  isTeacherEvent?: boolean;
  eventCategory?: string;
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

export default function EventForm({ eventSlug, minSize, maxSize, maxTeams, initialTeams, isTeacherEvent = false, eventCategory = "" }: EventFormProps) {
  const allowedClasses = getAllowedClasses(eventCategory);
  
  const startingTeams = initialTeams.length > 0 ? initialTeams : [[]];

  const paddedTeams = startingTeams.map(teamStudents => {
    const padded = Array(maxSize).fill(emptyStudent);
    teamStudents.forEach((student, i) => {
      if (i < maxSize) {
        // If they had an old class but it's not in the allowed list, default to the first allowed class
        const cls = allowedClasses.includes(student.className) ? student.className : allowedClasses[0];
        padded[i] = { 
          ...emptyStudent, 
          ...student, 
          className: cls,
          section: student.section || "" 
        };
      }
    });
    return padded;
  });

  const [teams, setTeams] = useState<StudentInfo[][]>(paddedTeams);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFieldChange = (teamIndex: number, studentIndex: number, field: keyof StudentInfo, value: string) => {
    const newTeams = [...teams];
    newTeams[teamIndex] = [...newTeams[teamIndex]];
    newTeams[teamIndex][studentIndex] = {
      ...newTeams[teamIndex][studentIndex],
      [field]: value
    };
    
    // Automatically set class if not set and there's only one option
    if (field === 'name' && allowedClasses.length === 1 && !newTeams[teamIndex][studentIndex].className) {
      newTeams[teamIndex][studentIndex].className = allowedClasses[0];
    }
    
    setTeams(newTeams);
    setSuccess(false);
  };

  const addTeam = () => {
    if (teams.length < maxTeams) {
      setTeams([...teams, Array(maxSize).fill({ ...emptyStudent, className: allowedClasses[0] })]);
      setSuccess(false);
    }
  };

  const removeTeam = (index: number) => {
    const newTeams = teams.filter((_, i) => i !== index);
    setTeams(newTeams);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate teams
    for (let i = 0; i < teams.length; i++) {
      const validStudents = teams[i].filter(s => 
        isTeacherEvent 
          ? s.name.trim().length > 0
          : s.name.trim().length > 0 && s.className.trim().length > 0 && s.section.trim().length > 0 && s.admissionNumber.trim().length > 0
      );

      // Check for partial filling
      const partialStudents = teams[i].filter(s => {
        if (isTeacherEvent) return false;
        const hasSome = s.name.trim().length > 0 || s.className.trim().length > 0 || s.section.trim().length > 0 || s.admissionNumber.trim().length > 0;
        const hasAll = s.name.trim().length > 0 && s.className.trim().length > 0 && s.section.trim().length > 0 && s.admissionNumber.trim().length > 0;
        return hasSome && !hasAll;
      });

      if (partialStudents.length > 0) {
        setError(`Team ${i + 1} has incomplete student details. Name, Class, Section, and ID are mandatory for a participant.`);
        setLoading(false);
        return;
      }

      if (validStudents.length > 0 && validStudents.length < minSize) {
        setError(`Team ${i + 1} must have at least ${minSize} fully registered participant(s).`);
        setLoading(false);
        return;
      }
    }

    const result = await saveEventEnrollments(eventSlug, teams, isTeacherEvent);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {teams.map((team, teamIndex) => (
        <div key={teamIndex} className="p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-2xl relative">
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-onyx">Team {teamIndex + 1}</h3>
            {teams.length > 1 && (
              <button
                type="button"
                onClick={() => removeTeam(teamIndex)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <Trash2 size={16} /> Remove
              </button>
            )}
          </div>

          <div className="hidden md:grid grid-cols-12 gap-4 mb-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-3 text-center">
            <div className="col-span-1">#</div>
            <div className={`text-left ${isTeacherEvent ? 'col-span-10' : 'col-span-4'}`}>{isTeacherEvent ? "Teacher Name" : "Student Name"}</div>
            {!isTeacherEvent && <div className="col-span-2 text-left">Class</div>}
            {!isTeacherEvent && <div className="col-span-2 text-left">Section</div>}
            {!isTeacherEvent && <div className="col-span-2 text-left">Admission No.</div>}
            <div className="col-span-1">Status</div>
          </div>

          <div className="space-y-5 md:space-y-0 md:flex md:flex-col">
            {team.map((student, index) => {
              const isRequired = index < minSize;
              
              return (
                <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center py-5 md:py-3.5 border-b border-gray-100 last:border-b-0 px-2 group hover:bg-gray-50/50 rounded-lg transition-colors -mx-2">
                  
                  {/* Mobile Header & Desktop Participant # */}
                  <div className="col-span-1 flex items-center justify-between md:justify-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isRequired ? 'bg-onyx text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                        {index + 1}
                      </div>
                      <span className="md:hidden font-bold text-onyx">Participant {index + 1}</span>
                    </div>
                    {/* Badge for MOBILE only */}
                    <div className="md:hidden">
                      {isRequired ? (
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100 shrink-0">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-gray-200 shrink-0">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Inputs */}
                  <div className={`flex flex-col gap-1.5 ${isTeacherEvent ? 'col-span-10' : 'col-span-4'}`}>
                    <label className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{isTeacherEvent ? "Teacher Name" : "Student Name"}</label>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => handleFieldChange(teamIndex, index, 'name', e.target.value)}
                      placeholder={isTeacherEvent ? "e.g. Mrs. Smith" : "e.g. John Doe"}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400 shadow-sm"
                    />
                  </div>
                  
                  {!isTeacherEvent && (
                    <>
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Class</label>
                        <select
                          value={student.className || allowedClasses[0]}
                          onChange={(e) => handleFieldChange(teamIndex, index, 'className', e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-onyx shadow-sm"
                        >
                          {allowedClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Section</label>
                        <input
                          type="text"
                          value={student.section}
                          onChange={(e) => handleFieldChange(teamIndex, index, 'section', e.target.value)}
                          placeholder="e.g. A"
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400 shadow-sm uppercase"
                        />
                      </div>
                      
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="md:hidden text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Admission No.</label>
                        <input
                          type="text"
                          value={student.admissionNumber}
                          onChange={(e) => handleFieldChange(teamIndex, index, 'admissionNumber', e.target.value)}
                          placeholder="ID Card No."
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400 shadow-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* Desktop Badge */}
                  <div className="hidden md:flex col-span-1 justify-center">
                    {isRequired ? (
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100 shrink-0">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-gray-200 shrink-0">
                        Optional
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {teams.length < maxTeams && (
        <button
          type="button"
          onClick={addTeam}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-taupe font-semibold hover:border-onyx hover:text-onyx hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add Another Team
        </button>
      )}

      <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">Successfully saved participants and their details!</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-center sm:text-left">
            <p className="text-red-600 font-bold mb-1 flex items-center gap-1.5 justify-center sm:justify-start">
              <AlertCircle size={14} />
              Please make sure to click "Save Participants" below to confirm your registration.
            </p>
            <p className="text-taupe">
              You can return and edit these details at any time until the registration deadline.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-onyx text-white px-8 py-3 rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Save Participants"}
          </button>
        </div>
      </div>
    </form>
  );
}
