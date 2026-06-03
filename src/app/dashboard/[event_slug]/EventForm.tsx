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
}

const emptyStudent = { name: "", classDetails: "", admissionNumber: "" };

export default function EventForm({ eventSlug, minSize, maxSize, maxTeams, initialTeams }: EventFormProps) {
  const startingTeams = initialTeams.length > 0 ? initialTeams : [[]];

  const paddedTeams = startingTeams.map(teamStudents => {
    const padded = Array(maxSize).fill(emptyStudent);
    teamStudents.forEach((student, i) => {
      if (i < maxSize) padded[i] = student;
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
    setTeams(newTeams);
    setSuccess(false);
  };

  const addTeam = () => {
    if (teams.length < maxTeams) {
      setTeams([...teams, Array(maxSize).fill(emptyStudent)]);
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
        s.name.trim().length > 0 && s.classDetails.trim().length > 0 && s.admissionNumber.trim().length > 0
      );

      // Check for partial filling
      const partialStudents = teams[i].filter(s => {
        const hasSome = s.name.trim().length > 0 || s.classDetails.trim().length > 0 || s.admissionNumber.trim().length > 0;
        const hasAll = s.name.trim().length > 0 && s.classDetails.trim().length > 0 && s.admissionNumber.trim().length > 0;
        return hasSome && !hasAll;
      });

      if (partialStudents.length > 0) {
        setError(`Team ${i + 1} has incomplete student details. All 3 fields are mandatory for a participant.`);
        setLoading(false);
        return;
      }

      if (validStudents.length > 0 && validStudents.length < minSize) {
        setError(`Team ${i + 1} must have at least ${minSize} fully registered participant(s).`);
        setLoading(false);
        return;
      }
    }

    const result = await saveEventEnrollments(eventSlug, teams);
    
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
        <div key={teamIndex} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl relative">
          
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

          <div className="space-y-6">
            {team.map((student, index) => {
              const isRequired = index < minSize;
              
              return (
                <div key={index} className={`flex flex-col gap-4 p-5 md:p-6 bg-white border rounded-xl shadow-sm transition-all ${isRequired ? 'border-blue-100 ring-1 ring-blue-50' : 'border-gray-100'}`}>
                  
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isRequired ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                        {index + 1}
                      </div>
                      <span className="font-semibold text-onyx">Participant {index + 1}</span>
                    </div>
                    {isRequired ? (
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                        Required
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                        Optional
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full pt-1">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Student Name</label>
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) => handleFieldChange(teamIndex, index, 'name', e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Class / Section</label>
                      <input
                        type="text"
                        value={student.classDetails}
                        onChange={(e) => handleFieldChange(teamIndex, index, 'classDetails', e.target.value)}
                        placeholder="e.g. 10th A"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Admission No.</label>
                      <input
                        type="text"
                        value={student.admissionNumber}
                        onChange={(e) => handleFieldChange(teamIndex, index, 'admissionNumber', e.target.value)}
                        placeholder="ID Card No."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
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
          <p className="text-sm text-taupe text-center sm:text-left">
            You can return and edit these details at any time until the registration deadline.
          </p>
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
