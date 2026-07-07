import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";
import EditableStudentCard from "./EditableStudentCard";
import AdminAddTeamModal from "./AdminAddTeamModal";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

export const revalidate = 0; // Always fetch fresh data

export default async function RegistrationsDashboard() {
  // Fetch Data
  const [
    { data: schools },
    { data: students },
    { data: enrollments }
  ] = await Promise.all([
    supabase.from("schools").select("id, name, teacher_name"),
    supabase.from("students").select("id, school_id, name, class_details, admission_number"),
    supabase.from("event_enrollments").select("student_id, event_slug, team_id")
  ]);

  const configPath = path.join(process.cwd(), "events-config.json");
  const configRaw = fs.readFileSync(configPath, "utf-8");
  const config = JSON.parse(configRaw);
  const eventsInfo = config.events;

  // Helper to get Event by slug
  const getEventBySlug = (slug: string) => eventsInfo.find((e: any) => e.slug === slug);

  // Pre-process enrollments to easily lookup by student_id
  const studentEnrollments = new Map<string, any[]>();
  enrollments?.forEach(e => {
    if (!studentEnrollments.has(e.student_id)) {
      studentEnrollments.set(e.student_id, []);
    }
    studentEnrollments.get(e.student_id)!.push(e);
  });

  // Build the hierarchical data structure
  const schoolData = schools?.map(school => {
    const schoolStudents = students?.filter(s => s.school_id === school.id) || [];
    
    // Group enrollments by Event Category -> Event -> Team -> Students
    const categoriesMap = new Map<string, any>();
    
    schoolStudents.forEach(student => {
      const studentEnrolls = studentEnrollments.get(student.id) || [];
      
      studentEnrolls.forEach(enroll => {
        const eventDef = getEventBySlug(enroll.event_slug);
        if (!eventDef) return;
        
        const categoryName = eventDef.category;
        const eventName = eventDef.name;
        const teamId = enroll.team_id;
        
        if (!categoriesMap.has(categoryName)) {
          categoriesMap.set(categoryName, new Map<string, any>());
        }
        
        const eventMap = categoriesMap.get(categoryName);
        if (!eventMap.has(eventName)) {
          eventMap.set(eventName, new Map<string, any>());
        }
        
        const teamMap = eventMap.get(eventName);
        if (!teamMap.has(teamId)) {
          teamMap.set(teamId, []);
        }
        
        teamMap.get(teamId).push(student);
      });
    });

    return {
      id: school.id,
      name: school.name,
      teacher: school.teacher_name,
      categories: Array.from(categoriesMap.entries() as IterableIterator<[string, any]>).map(([catName, eventMap]) => ({
        name: catName,
        events: Array.from(eventMap.entries() as IterableIterator<[string, any]>).map(([evName, teamMap]) => {
          const eDef = eventsInfo.find((e: any) => e.name === evName);
          return {
            name: evName,
            slug: eDef?.slug || "",
            minSize: eDef?.minSize || 1,
            maxSize: eDef?.maxSize || 1,
            isTeacherEvent: eDef?.isTeacherEvent || false,
            category: catName,
            teams: Array.from(teamMap.entries() as IterableIterator<[string, any]>).map(([tId, studentsList]) => ({
              id: tId,
              students: studentsList
            }))
          };
        })
      }))
    };
  }).filter(school => school.categories.length > 0) || [];
  
  // Sort schools alphabetically
  schoolData.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto animate-slide-up py-6 lg:py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-onyx tracking-tight">Detailed Registrations</h1>
          <p className="text-taupe mt-1">Hierarchical view of all schools and their registered participants.</p>
        </div>
      </div>

      <div className="space-y-4">
        {schoolData.length === 0 && (
          <div className="p-10 text-center bg-gray-50 rounded-xl border border-gray-200 text-taupe font-medium">
            No registrations found yet.
          </div>
        )}

        {schoolData.map(school => (
          <details key={school.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors list-none [&::-webkit-details-marker]:hidden font-semibold text-lg text-onyx">
              <div className="flex items-center gap-3">
                <ChevronRight className="transition-transform group-open:rotate-90 text-gray-400" size={20} />
                {school.name}
              </div>
              <span className="text-sm font-normal text-taupe bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                Teacher: {school.teacher || "N/A"}
              </span>
            </summary>
            
            <div className="p-5 border-t border-gray-200 space-y-4 bg-white">
              <div className="flex justify-start border-b border-gray-100 pb-4">
                <AdminAddTeamModal 
                  schoolId={school.id} 
                  schoolName={school.name} 
                  eventsConfig={eventsInfo} 
                />
              </div>
              {school.categories.map(category => (
                <details key={category.name} className="group/cat bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <summary className="flex items-center gap-2 p-4 cursor-pointer hover:bg-gray-100 transition-colors list-none [&::-webkit-details-marker]:hidden font-medium text-onyx">
                    <ChevronRight className="transition-transform group-open/cat:rotate-90 text-gray-400" size={18} />
                    <span className="text-gold-dark font-bold">{category.name}</span>
                  </summary>
                  
                  <div className="p-4 border-t border-gray-200 space-y-4 bg-white">
                    {category.events.map(event => (
                      <details key={event.name} className="group/evt rounded-lg border border-gray-100 shadow-sm overflow-hidden" open>
                        <summary className="flex items-center gap-2 p-3 cursor-pointer bg-blue-50/50 hover:bg-blue-50 transition-colors list-none [&::-webkit-details-marker]:hidden font-medium text-onyx">
                          <ChevronRight className="transition-transform group-open/evt:rotate-90 text-blue-400" size={16} />
                          {event.name}
                        </summary>
                        
                        <div className="p-0 border-t border-gray-100">
                          {event.teams.map((team, tIdx) => (
                            <div key={team.id} className="border-b border-gray-100 last:border-b-0 p-4">
                              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                Team {tIdx + 1} <span className="text-gray-300 font-normal normal-case">({team.id})</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {team.students.map((student: any) => (
                                  <EditableStudentCard key={student.id} student={student} />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
