import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Checklist } from "@/components/Checklist";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function SchoolPage({ params }: { params: Promise<{ qr_code_id: string }> }) {
  const { qr_code_id } = await params;

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("qr_code_id", qr_code_id)
    .single();

  if (!school) {
    notFound();
  }

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("school_id", school.id)
    .order("name");

  const count = students?.length || 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
      {/* Left sidebar — school info, fixed on desktop */}
      <div className="lg:w-80 xl:w-96 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 px-6 lg:px-8 py-6 lg:py-10 flex flex-col shrink-0">
        <Link href="/attendance" className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors w-fit mb-6 lg:mb-10">
          <ArrowLeft size={14} />
          Back
        </Link>

        <div className="lg:sticky lg:top-28">
          <h1 className="text-2xl lg:text-3xl font-semibold text-onyx tracking-tight leading-snug">
            {school.name}
          </h1>
          {school.teacher_name && (
            <p className="text-taupe mt-2 text-sm">
              Teacher: <span className="text-onyx font-medium">{school.teacher_name}</span>
            </p>
          )}

          <div className="flex items-center gap-6 mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-100">
            <div>
              <div className="text-xl font-semibold text-onyx tabular-nums">{count}</div>
              <div className="text-xs text-taupe mt-0.5">Registered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right content — checklist */}
      <div className="flex-1 px-6 lg:px-10 xl:px-14 py-6 lg:py-10">
        <Checklist schoolId={school.id} schoolName={school.name} initialStudents={students || []} />
      </div>
    </div>
  );
}
