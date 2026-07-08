import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Building2, ChevronRight, Search } from "lucide-react";

export const revalidate = 0; // Always fetch fresh data

export default async function RegistrationsSchoolPicker() {
  // Fetch all schools
  const { data: schools } = await supabase
    .from("schools")
    .select("id, name, teacher_name")
    .order("name");

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto animate-slide-up py-6 lg:py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-onyx tracking-tight">Select a School</h1>
          <p className="text-taupe mt-1">Choose a school to view and edit their event registrations.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-100">
          {schools?.map(school => (
            <Link 
              key={school.id}
              href={`/admin/registrations/${school.id}`}
              className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-onyx text-lg">{school.name}</h3>
                  <p className="text-taupe text-sm">Teacher: {school.teacher_name || "N/A"}</p>
                </div>
              </div>
              <div className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                <ChevronRight size={24} />
              </div>
            </Link>
          ))}
          {(!schools || schools.length === 0) && (
            <div className="p-10 text-center text-taupe font-medium">
              No schools found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
