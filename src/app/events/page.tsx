import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

export const revalidate = 0;

export default async function EventsPage() {
  const { data: events } = await supabase.from("events").select("*").order("name");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-10">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-5xl font-semibold text-onyx tracking-tight leading-tight">
            Event Scoring
          </h1>
          <p className="text-taupe mt-3 lg:mt-4 text-base lg:text-lg leading-relaxed max-w-lg mx-auto">
            Select an event below to begin judging the participating schools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {events?.map((event) => (
            <Link 
              key={event.id} 
              href={`/events/${event.slug}`}
              className="group bg-white border border-gray-200 rounded-xl p-6 lg:p-8 hover:border-gold hover:shadow-md transition-all flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold-50 group-hover:border-gold/20 transition-colors">
                <Trophy size={20} className="text-taupe group-hover:text-gold transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-onyx mb-2">{event.name}</h2>
              <p className="text-taupe text-sm leading-relaxed mb-6 flex-1">
                {event.description}
              </p>
              
              <div className="inline-flex items-center gap-2 text-sm font-medium text-onyx mt-auto">
                Judge this event
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}

          {(!events || events.length === 0) && (
            <div className="col-span-full py-20 text-center text-taupe border border-dashed border-gray-300 rounded-xl">
              No events found. Please run the seed script.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
