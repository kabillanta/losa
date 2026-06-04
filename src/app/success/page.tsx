import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ offline?: string }> }) {
  const resolvedParams = await searchParams;
  const isOffline = resolvedParams?.offline === "true";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="flex flex-col items-center gap-8 text-center px-6 py-20 animate-slide-up">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isOffline ? 'bg-amber-500' : 'bg-gold'}`}>
          <Check className="text-white" size={32} strokeWidth={3} />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-onyx tracking-tight">
            {isOffline ? "Saved Offline" : "Attendance submitted"}
          </h1>
          <p className="text-taupe mt-3 max-w-sm mx-auto leading-relaxed">
            {isOffline 
              ? "The roster has been securely saved to your device. It will automatically sync when your connection returns." 
              : "The roster has been recorded. You can now scan the next group."}
          </p>
        </div>

        <Link 
          href="/attendance"
          className="inline-block bg-onyx text-white font-medium py-3 px-8 rounded-lg hover:bg-black transition-colors shadow-sm"
        >
          Scan next group
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
