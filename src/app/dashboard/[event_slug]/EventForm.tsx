"use client";

import { useState } from "react";
import { saveEventEnrollments } from "../actions";
import { Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";

interface EventFormProps {
  eventSlug: string;
  minSize: number;
  maxSize: number;
  maxTeams: number;
  initialTeams: string[][];
}

export default function EventForm({ eventSlug, minSize, maxSize, maxTeams, initialTeams }: EventFormProps) {
  // If they have no teams yet, give them 1 empty team
  const startingTeams = initialTeams.length > 0 ? initialTeams : [[]];

  // Pad teams to maxSize
  const paddedTeams = startingTeams.map(teamNames => {
    const padded = Array(maxSize).fill("");
    teamNames.forEach((name, i) => {
      if (i < maxSize) padded[i] = name;
    });
    return padded;
  });

  const [teams, setTeams] = useState<string[][]>(paddedTeams);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleNameChange = (teamIndex: number, studentIndex: number, value: string) => {
    const newTeams = [...teams];
    newTeams[teamIndex] = [...newTeams[teamIndex]];
    newTeams[teamIndex][studentIndex] = value;
    setTeams(newTeams);
    setSuccess(false);
  };

  const addTeam = () => {
    if (teams.length < maxTeams) {
      setTeams([...teams, Array(maxSize).fill("")]);
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
      const filledNamesCount = teams[i].filter(n => n.trim().length > 0).length;
      if (filledNamesCount > 0 && filledNamesCount < minSize) {
        setError(`Team ${i + 1} must have at least ${minSize} participant(s).`);
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
          
          <div className="flex items-center justify-between mb-4">
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

          <div className="space-y-4">
            {team.map((name, index) => {
              const isRequired = index < minSize;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-taupe shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(teamIndex, index, e.target.value)}
                      placeholder={isRequired ? "Student Name (Required)" : "Student Name (Optional)"}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-onyx/20 focus:border-onyx transition-all shadow-sm"
                    />
                  </div>
                  {isRequired && (
                    <div className="text-xs font-semibold text-red-500 uppercase tracking-wider shrink-0 w-16">
                      Required
                    </div>
                  )}
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
            <p className="text-sm font-medium">Successfully saved participants for this event!</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-taupe text-center sm:text-left">
            You can return and edit these teams at any time until the registration deadline.
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
