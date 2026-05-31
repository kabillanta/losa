import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Users, Building2, UserCheck, Printer } from "lucide-react";

export const revalidate = 0; // Always fetch fresh stats

export default async function AdminDashboard() {
  // Fetch all schools
  const { data: schools } = await supabase.from("schools").select("*");
  
  // Fetch all students
  const { data: students } = await supabase.from("students").select("*");

  const totalSchools = schools?.length || 0;
  const totalStudents = students?.length || 0;
  
  const presentStudents = students?.filter((s) => s.is_present).length || 0;
  const absentStudents = totalStudents - presentStudents;
  
  const attendancePercentage = totalStudents > 0 
    ? Math.round((presentStudents / totalStudents) * 100) 
    : 0;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto animate-slide-up py-6 lg:py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-onyx tracking-tight">Admin Dashboard</h1>
          <p className="text-taupe mt-2">Live event statistics and management.</p>
        </div>
        
        <Link 
          href="/admin/print"
          className="inline-flex items-center gap-2 bg-onyx text-white font-medium px-6 py-3 rounded-lg hover:bg-black transition-colors shadow-sm w-fit"
        >
          <Printer size={18} />
          Print QR Codes
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-taupe text-sm font-semibold uppercase tracking-wider">
            <Building2 size={16} /> Total Schools
          </div>
          <div className="text-4xl font-semibold text-onyx">{totalSchools}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-taupe text-sm font-semibold uppercase tracking-wider">
            <Users size={16} /> Total Students
          </div>
          <div className="text-4xl font-semibold text-onyx">{totalStudents}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gold/40 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none"></div>
          <div className="flex items-center gap-2 text-gold-dark text-sm font-semibold uppercase tracking-wider relative z-10">
            <UserCheck size={16} /> Checked In
          </div>
          <div className="text-4xl font-semibold text-onyx relative z-10 flex items-baseline gap-2">
            {presentStudents} 
            <span className="text-lg text-taupe font-medium">({attendancePercentage}%)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-taupe text-sm font-semibold uppercase tracking-wider">
            Remaining
          </div>
          <div className="text-4xl font-semibold text-onyx">{absentStudents}</div>
        </div>
      </div>

      {/* Breakdowns */}
      <h2 className="text-xl font-semibold text-onyx mb-4">School Breakdown</h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-sm font-semibold text-taupe uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 md:p-5">School Name</th>
                <th className="p-4 md:p-5">Teacher</th>
                <th className="p-4 md:p-5 text-center">Total</th>
                <th className="p-4 md:p-5 text-center">Present</th>
                <th className="p-4 md:p-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schools?.map((school) => {
                const schoolStudents = students?.filter(s => s.school_id === school.id) || [];
                const schoolPresent = schoolStudents.filter(s => s.is_present).length;
                const isComplete = schoolStudents.length > 0 && schoolPresent === schoolStudents.length;

                return (
                  <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 md:p-5 font-medium text-onyx">{school.name}</td>
                    <td className="p-4 md:p-5 text-taupe">{school.teacher_name || "—"}</td>
                    <td className="p-4 md:p-5 text-center tabular-nums">{schoolStudents.length}</td>
                    <td className="p-4 md:p-5 text-center tabular-nums font-medium text-onyx">{schoolPresent}</td>
                    <td className="p-4 md:p-5 text-right">
                      {isComplete ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          Pending
                        </span>
                      )}
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
