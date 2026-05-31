"use client";

import { useState, useEffect } from "react";
import { submitScore } from "@/app/events/[slug]/score/[school_id]/actions";
import { Loader2, Save } from "lucide-react";
import config from "../../events-config.json";

type RubricItem = {
  id: string;
  name: string;
  max_points: number;
};

export function ScoringForm({ 
  eventId, 
  schoolId, 
  eventSlug, 
  rubric 
}: { 
  eventId: string; 
  schoolId: string; 
  eventSlug: string; 
  rubric: RubricItem[] 
}) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [judgeName, setJudgeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load judge name from local storage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("losa_judge_name");
    if (savedName) setJudgeName(savedName);
  }, []);

  const totalScore = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
  const maxTotal = rubric.reduce((a, b) => a + b.max_points, 0);

  const handleJudgeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJudgeName(e.target.value);
    localStorage.setItem("losa_judge_name", e.target.value);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await submitScore(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="schoolId" value={schoolId} />
      <input type="hidden" name="eventSlug" value={eventSlug} />

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-semibold text-onyx mb-2">
          Judge Name
        </label>
        <select 
          name="judgeName" 
          required 
          value={judgeName}
          onChange={(e) => handleJudgeNameChange(e as any)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx/20 focus:border-onyx transition-all appearance-none cursor-pointer"
        >
          <option value="" disabled>Select your name...</option>
          {config.events.find(e => e.slug === eventSlug)?.judges?.map(judge => (
            <option key={judge} value={judge}>{judge}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-onyx">Scoring Rubric</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {rubric.map((item) => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-medium text-onyx">{item.name}</div>
                <div className="text-sm text-taupe mt-1">Maximum points: {item.max_points}</div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  name={`score_${item.id}`} 
                  required
                  min="0" 
                  max={item.max_points}
                  value={scores[item.id] || ""}
                  onChange={(e) => setScores({ ...scores, [item.id]: parseInt(e.target.value) || 0 })}
                  className="w-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx/20 focus:border-onyx text-center text-lg font-semibold text-onyx"
                />
                <span className="text-taupe font-medium">/ {item.max_points}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 px-6 py-5 border-t border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-onyx uppercase tracking-wider text-sm">Total Score</div>
          <div className="text-2xl font-bold text-onyx">
            {totalScore} <span className="text-base text-taupe font-medium">/ {maxTotal}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium text-sm">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full md:w-auto md:ml-auto bg-onyx text-white font-medium py-3.5 px-8 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        Submit Final Score
      </button>
    </form>
  );
}
