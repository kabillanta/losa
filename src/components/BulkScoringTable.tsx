"use client";

import { useState, useEffect, useMemo } from "react";
import { submitBulkScores, BulkScoreInput } from "@/app/events/[slug]/actions";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";

type RubricItem = {
  id: string;
  name: string;
  max_points: number;
};

type Team = {
  schoolId: string;
  teamId: string;
  schoolName: string;
  studentNames: string[];
};

export function BulkScoringTable({
  eventId,
  eventSlug,
  rubric,
  teams,
  judges,
  existingScores,
}: {
  eventId: string;
  eventSlug: string;
  rubric: RubricItem[];
  teams: Team[];
  judges: string[];
  existingScores: any[];
}) {
  const [judgeName, setJudgeName] = useState("");
  // State maps teamId -> { criteriaId -> score }
  const [scores, setScores] = useState<Record<string, Record<string, number | "">>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // When judge changes, prefill scores
  useEffect(() => {
    const savedName = localStorage.getItem("losa_judge_name");
    if (savedName && judges.includes(savedName)) {
      setJudgeName(savedName);
    }
  }, [judges]);

  useEffect(() => {
    if (!judgeName) {
      setScores({});
      return;
    }

    const initialScores: Record<string, Record<string, number | "">> = {};
    
    // Initialize all teams with empty scores
    teams.forEach(team => {
      initialScores[team.teamId] = {};
      rubric.forEach(r => {
        initialScores[team.teamId][r.id] = "";
      });
    });

    // Populate with existing scores if any
    const judgeScores = existingScores.filter(s => s.judge_name === judgeName);
    judgeScores.forEach(score => {
      if (initialScores[score.team_id] && score.rubric_scores) {
        Object.keys(score.rubric_scores).forEach(key => {
          initialScores[score.team_id][key] = score.rubric_scores[key];
        });
      }
    });

    setScores(initialScores);
    setMessage(null);
  }, [judgeName, existingScores, teams, rubric]);

  const handleScoreChange = (teamId: string, criteriaId: string, value: string, max: number) => {
    let numVal: number | "" = parseInt(value, 10);
    if (isNaN(numVal)) numVal = "";
    else if (numVal < 0) numVal = 0;
    else if (numVal > max) numVal = max;

    setScores(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [criteriaId]: numVal
      }
    }));
  };

  const calculateTotal = (teamId: string) => {
    if (!scores[teamId]) return 0;
    return Object.values(scores[teamId]).reduce((sum, val) => sum + ((val as number) || 0), 0);
  };

  const handleSaveAll = async () => {
    if (!judgeName) {
      setMessage({ type: "error", text: "Please select a judge name first." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    // Build the payload
    const payload: BulkScoreInput[] = [];

    teams.forEach(team => {
      const teamScores = scores[team.teamId];
      if (!teamScores) return;

      // Only submit if at least one score is filled (or should we enforce all?)
      // We will submit any team that has at least one number entered
      const hasScores = Object.values(teamScores).some(val => val !== "");
      
      if (hasScores) {
        const rubricScores: Record<string, number> = {};
        let totalScore = 0;

        rubric.forEach(r => {
          const val = (teamScores[r.id] as number) || 0;
          rubricScores[r.id] = val;
          totalScore += val;
        });

        payload.push({
          eventId,
          schoolId: team.schoolId,
          teamId: team.teamId,
          judgeName,
          rubricScores,
          totalScore
        });
      }
    });

    if (payload.length === 0) {
      setIsSaving(false);
      setMessage({ type: "error", text: "No scores entered to save." });
      return;
    }

    const result = await submitBulkScores(payload, eventSlug);

    setIsSaving(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "All scores saved successfully!" });
      setTimeout(() => setMessage(null), 3000); // Clear success message after 3s
    }
  };

  const maxTotal = rubric.reduce((sum, r) => sum + r.max_points, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-end gap-4 justify-between">
        <div className="flex-1 w-full md:max-w-md">
          <label className="block text-sm font-semibold text-onyx mb-2">
            Select Judge Name
          </label>
          <select 
            value={judgeName}
            onChange={(e) => {
              setJudgeName(e.target.value);
              localStorage.setItem("losa_judge_name", e.target.value);
            }}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx/20 focus:border-onyx transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>Choose your name...</option>
            {judges.map(judge => (
              <option key={judge} value={judge}>{judge}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto">
          {message && (
            <div className={`flex items-center gap-2 px-4 py-3 md:py-2 rounded-lg text-sm font-medium w-full sm:w-auto justify-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
              {message.text}
            </div>
          )}
          <button 
            onClick={handleSaveAll}
            disabled={!judgeName || isSaving}
            className="bg-onyx text-white font-medium py-3 px-6 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap w-full sm:w-auto shadow-md md:shadow-none"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save All Scores
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 md:p-4 font-semibold text-onyx whitespace-nowrap min-w-[140px] md:min-w-[200px] max-w-[250px] border-r border-gray-200 sticky left-0 bg-gray-50 z-20 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">Team</th>
                {rubric.map(r => (
                  <th key={r.id} className="p-3 md:p-4 font-semibold text-onyx whitespace-nowrap min-w-[100px] md:min-w-[120px] text-center border-r border-gray-200 last:border-r-0">
                    <div className="truncate text-sm md:text-base" title={r.name}>{r.name}</div>
                    <div className="text-[10px] md:text-xs text-taupe font-normal mt-0.5">Max: {r.max_points}</div>
                  </th>
                ))}
                <th className="p-3 md:p-4 font-semibold text-onyx whitespace-nowrap min-w-[80px] md:min-w-[100px] text-center bg-gray-50 border-l border-gray-200 sticky right-0 z-20 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                  Total
                  <div className="text-[10px] md:text-xs text-taupe font-normal mt-0.5">/ {maxTotal}</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 relative">
              {!judgeName && (
                <tr>
                  <td colSpan={rubric.length + 2} className="p-8 text-center text-taupe">
                    Please select a judge name to start scoring.
                  </td>
                </tr>
              )}
              
              {judgeName && teams.length === 0 && (
                <tr>
                  <td colSpan={rubric.length + 2} className="p-8 text-center text-taupe">
                    No teams have registered for this event yet.
                  </td>
                </tr>
              )}

              {judgeName && teams.map((team, index) => {
                const teamScores = scores[team.teamId] || {};
                const total = calculateTotal(team.teamId);
                
                // Determine display suffix for multiple teams from same school
                const schoolTeams = teams.filter(t => t.schoolId === team.schoolId);
                const teamIndex = schoolTeams.findIndex(t => t.teamId === team.teamId) + 1;
                const displaySuffix = schoolTeams.length > 1 ? ` (Team ${teamIndex})` : "";

                return (
                  <tr key={team.teamId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3 md:p-4 border-r border-gray-200 sticky left-0 bg-white group-hover:bg-gray-50/50 z-10 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                      <div className="font-semibold text-onyx text-sm md:text-base line-clamp-2 md:line-clamp-1" title={`${team.schoolName}${displaySuffix}`}>{team.schoolName}{displaySuffix}</div>
                      {team.studentNames.length > 0 && (
                        <div className="text-[10px] md:text-xs text-taupe mt-1 line-clamp-1 md:line-clamp-2" title={team.studentNames.join(", ")}>
                          {team.studentNames.join(", ")}
                        </div>
                      )}
                    </td>
                    
                    {rubric.map(r => (
                      <td key={r.id} className="p-2 md:p-3 border-r border-gray-200 last:border-r-0 align-middle">
                        <input
                          type="number"
                          min="0"
                          max={r.max_points}
                          value={teamScores[r.id] ?? ""}
                          onChange={(e) => handleScoreChange(team.teamId, r.id, e.target.value, r.max_points)}
                          className="w-full min-w-[60px] md:min-w-[80px] px-2 py-2 md:px-3 md:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx/20 focus:border-onyx text-center text-base md:text-lg font-semibold text-onyx transition-all hover:bg-gray-100"
                        />
                      </td>
                    ))}

                    <td className="p-3 md:p-4 font-bold text-onyx text-center text-lg md:text-xl bg-gray-50/50 border-l border-gray-200 sticky right-0 z-10 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
