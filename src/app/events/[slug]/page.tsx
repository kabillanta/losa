import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";

export const revalidate = 0;

export default async function EventSchoolSelection({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) {
    notFound();
  }

  // Fetch schools, enrollments, and students to determine which schools are participating
  const [schoolsRes, enrollmentsRes, studentsRes] = await Promise.all([
    supabase.from("schools").select("*").order("name"),
    supabase.from("event_enrollments").select("student_id").eq("event_slug", slug),
    supabase.from("students").select("id, school_id")
  ]);

  const allSchools = schoolsRes.data || [];
  const enrollments = enrollmentsRes.data || [];
  const students = studentsRes.data || [];

  // Map student_id -> school_id
  const studentToSchool = new Map(students.map(s => [s.id, s.school_id]));

  // Determine which schools have at least one student enrolled in this event
  const participatingSchoolIds = new Set<string>();
  enrollments.forEach(e => {
    const schoolId = studentToSchool.get(e.student_id);
    if (schoolId) participatingSchoolIds.add(schoolId);
  });

  // Filter schools to only those participating
  const schools = allSchools.filter(school => participatingSchoolIds.has(school.id));

  // Fetch existing scores to see who has been judged
  const { data: scores } = await supabase
    .from("scores")
    .select("school_id")
    .eq("event_id", event.id);

  const scoredSchoolIds = new Set(scores?.map(s => s.school_id) || []);

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-6 animate-slide-up">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Events
      </Link>

      <div className="mb-10 pb-8 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-onyx tracking-tight">
          {event.name}
        </h1>
        <p className="text-taupe mt-3">{event.description}</p>
      </div>

      <h2 className="text-lg font-semibold text-onyx mb-6">Select a School to Score</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schools?.map((school) => {
          const isScored = scoredSchoolIds.has(school.id);

          return (
            <Link 
              key={school.id}
              href={`/events/${event.slug}/score/${school.id}`}
              className={`flex items-center justify-between p-5 rounded-xl border transition-all ${
                isScored 
                  ? "bg-gray-50 border-gray-200 hover:border-gray-300" 
                  : "bg-white border-gray-200 hover:border-onyx hover:shadow-sm"
              }`}
            >
              <div>
                <h3 className={`font-semibold ${isScored ? "text-taupe" : "text-onyx"}`}>
                  {school.name}
                </h3>
                {school.teacher_name && (
                  <p className="text-xs text-taupe mt-1">Rep: {school.teacher_name}</p>
                )}
              </div>
              
              {isScored ? (
                <span className="text-xs font-medium bg-green-100 text-green-800 px-2.5 py-1 rounded-full border border-green-200">
                  Scored
                </span>
              ) : (
                <div className="text-onyx bg-gray-50 p-2 rounded-full">
                  <Edit3 size={16} />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
