import { SchoolSelector } from "@/components/SchoolSelector";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function Home() {
  const { data: schools } = await supabase
    .from("schools")
    .select("id, name, teacher_name, qr_code_id")
    .order("name");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-10 lg:py-0">
      <div className="w-full max-w-3xl text-center mb-8 lg:mb-10">
        <h1 className="text-3xl lg:text-5xl font-semibold text-onyx tracking-tight leading-tight">
          Group Check-in
        </h1>
        <p className="text-taupe mt-3 lg:mt-4 text-base lg:text-lg leading-relaxed max-w-lg mx-auto">
          Select a school from the list or scan the teacher's QR code to load the student roster.
        </p>
      </div>

      <div className="w-full max-w-xl">
        <SchoolSelector initialSchools={schools || []} />
      </div>
    </div>
  );
}
