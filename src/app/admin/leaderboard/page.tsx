import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";

export const revalidate = 0; // Live dashboard

export default async function LeaderboardPage() {
  const [eventsRes, schoolsRes, scoresRes, studentsRes, enrollmentsRes] = await Promise.all([
    supabase.from("events").select("*"),
    supabase.from("schools").select("*"),
    supabase.from("scores").select("*"),
    supabase.from("students").select("*"),
    supabase.from("event_enrollments").select("*"),
  ]);

  const events = eventsRes.data || [];
  const schools = schoolsRes.data || [];
  const scores = scoresRes.data || [];
  const students = studentsRes.data || [];
  const enrollments = enrollmentsRes.data || [];

  // Group students by school for easy lookup
  const studentsBySchool: Record<string, typeof students> = {};
  students.forEach(student => {
    if (!studentsBySchool[student.school_id]) {
       studentsBySchool[student.school_id] = [];
    }
    studentsBySchool[student.school_id].push(student);
  });

  // Map event_slug to Set of student IDs for fast filtering
  const eventStudentsMap: Record<string, Set<string>> = {};
  enrollments.forEach((enroll) => {
    if (!eventStudentsMap[enroll.event_slug]) {
      eventStudentsMap[enroll.event_slug] = new Set();
    }
    eventStudentsMap[enroll.event_slug].add(enroll.student_id);
  });

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
                <details
                  key={entry.school.id}
                  className={`group transition-colors ${index === 0 ? "bg-gold/5" : "hover:bg-gray-50"}`}
                >
                  <summary className="flex items-center p-5 md:p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none">
                    <div className="mr-5 md:mr-6 flex justify-center w-8 shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg md:text-xl ${index === 0 ? "text-gold" : "text-onyx"} group-hover:underline decoration-gray-300 underline-offset-4`}
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
                  </summary>

                  {/* Expanded Student List */}
                  <div className="px-5 md:px-6 pb-6 pt-1 md:pl-[5.5rem] pl-16 cursor-default">
                    <div className="text-xs font-bold text-onyx mb-3 uppercase tracking-wider border-b border-gray-200 pb-2">
                      Registered Students
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {studentsBySchool[entry.school.id]?.length ? (
                        studentsBySchool[entry.school.id].map((student) => (
                          <span key={student.id} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-taupe text-sm font-medium shadow-sm hover:border-gray-300 transition-colors">
                            {student.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400 italic">No students registered yet.</span>
                      )}
                    </div>
                  </div>
                </details>
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
                    <details
                      key={entry.school.id}
                      className="group transition-colors hover:bg-gray-50"
                    >
                      <summary className="flex items-center p-4 md:p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none">
                        <div className="mr-4 flex justify-center w-6 shrink-0">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-onyx group-hover:underline decoration-gray-300 underline-offset-2">
                            {entry.school.name}
                          </h4>
                        </div>
                        <div className="text-xl font-bold text-onyx ml-4">
                          {entry.total}
                        </div>
                      </summary>

                      {/* Expanded Student List */}
                      <div className="px-4 md:px-5 pb-5 md:pl-14 pl-[3.25rem] cursor-default">
                        <div className="flex flex-wrap gap-1.5">
                          {(() => {
                            const eventStudents = studentsBySchool[entry.school.id]?.filter(
                              s => eventStudentsMap[event.id]?.has(s.id)
                            ) || [];

                            if (eventStudents.length === 0) {
                              return <span className="text-xs text-gray-400 italic">No students registered for this event.</span>;
                            }

                            return eventStudents.map((student) => (
                              <span key={student.id} className="inline-flex items-center px-2 py-1 rounded bg-white border border-gray-200 text-taupe text-xs font-medium shadow-sm hover:border-gray-300 transition-colors">
                                {student.name}
                              </span>
                            ));
                          })()}
                        </div>
                      </div>
                    </details>
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
