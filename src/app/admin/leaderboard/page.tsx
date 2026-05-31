import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";

export const revalidate = 0; // Live dashboard

export default async function LeaderboardPage() {
  const [eventsRes, schoolsRes, scoresRes] = await Promise.all([
    supabase.from("events").select("*"),
    supabase.from("schools").select("*"),
    supabase.from("scores").select("*"),
  ]);

  const events = eventsRes.data || [];
  const schools = schoolsRes.data || [];
  const scores = scoresRes.data || [];

  // Map school IDs to School Objects for easy lookup
  const schoolMap = new Map(schools.map((s) => [s.id, s]));

  // Calculate Overall School Championship
  const overallScores: Record<
    string,
    { school: any; total: number; judges: number }
  > = {};

  scores.forEach((score) => {
    if (!overallScores[score.school_id]) {
      overallScores[score.school_id] = {
        school: schoolMap.get(score.school_id),
        total: 0,
        judges: 0,
      };
    }
    overallScores[score.school_id].total += score.total_score;
    overallScores[score.school_id].judges += 1;
  });

  const overallLeaderboard = Object.values(overallScores)
    .filter((entry) => entry.school) // Ensure school exists
    .sort((a, b) => b.total - a.total);

  // Calculate Event-Specific Leaderboards
  const eventLeaderboards = events.map((event) => {
    const eventScores = scores.filter((s) => s.event_id === event.id);
    const schoolEventTotals: Record<
      string,
      { school: any; total: number; judges: number }
    > = {};

    eventScores.forEach((score) => {
      if (!schoolEventTotals[score.school_id]) {
        schoolEventTotals[score.school_id] = {
          school: schoolMap.get(score.school_id),
          total: 0,
          judges: 0,
        };
      }
      schoolEventTotals[score.school_id].total += score.total_score;
      schoolEventTotals[score.school_id].judges += 1;
    });

    return {
      event,
      leaderboard: Object.values(schoolEventTotals)
        .filter((entry) => entry.school)
        .sort((a, b) => b.total - a.total),
    };
  });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="text-yellow-500" size={24} />;
    if (index === 1) return <Medal className="text-gray-400" size={24} />;
    if (index === 2) return <Award className="text-amber-600" size={24} />;
    return (
      <span className="text-lg font-bold text-gray-400 w-6 text-center">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-6 animate-slide-up">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="mb-12 pb-8 border-b border-gray-200">
        <h1 className="text-3xl md:text-5xl font-bold text-onyx tracking-tight">
          Live Leaderboard
        </h1>
        <p className="text-taupe mt-3 text-lg">
          Real-time standings across all events.
        </p>
      </div>

      {/* OVERALL CHAMPIONSHIP */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gold/10 p-3 rounded-xl border border-gold/20">
            <Trophy className="text-gold" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-onyx">Overall Championship</h2>
        </div>

        {overallLeaderboard.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center text-taupe font-medium">
            No scores have been submitted yet.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {overallLeaderboard.map((entry, index) => (
                <div
                  key={entry.school.id}
                  className={`flex items-center p-5 md:p-6 transition-colors hover:bg-gray-50 ${index === 0 ? "bg-gold/5" : ""}`}
                >
                  <div className="mr-5 md:mr-6 flex justify-center w-8">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-bold text-lg md:text-xl ${index === 0 ? "text-gold" : "text-onyx"}`}
                    >
                      {entry.school.name}
                    </h3>
                    <p className="text-sm text-taupe mt-0.5">
                      {entry.judges} score{entry.judges !== 1 && "s"} total
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-3xl md:text-4xl font-bold text-onyx tracking-tighter">
                      {entry.total}
                    </div>
                    <div className="text-xs font-semibold text-taupe uppercase tracking-wider mt-1">
                      Points
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* EVENT SPECIFIC LEADERBOARDS */}
      <section>
        <h2 className="text-2xl font-bold text-onyx mb-8 pb-4 border-b border-gray-200">
          Event Rankings
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {eventLeaderboards.map(({ event, leaderboard }) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
            >
              <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-onyx text-lg">{event.name}</h3>
                <span className="text-xs font-semibold text-taupe bg-gray-200 px-2 py-1 rounded-md">
                  {leaderboard.length} Schools
                </span>
              </div>

              <div className="divide-y divide-gray-100 flex-1">
                {leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-taupe text-sm">
                    No scores submitted.
                  </div>
                ) : (
                  leaderboard.map((entry, index) => (
                    <div
                      key={entry.school.id}
                      className="flex items-center p-4 md:p-5"
                    >
                      <div className="mr-4 flex justify-center w-6">
                        {getRankIcon(index)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-onyx">
                          {entry.school.name}
                        </h4>
                      </div>
                      <div className="text-xl font-bold text-onyx ml-4">
                        {entry.total}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
