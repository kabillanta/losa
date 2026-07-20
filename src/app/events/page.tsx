import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import config from "../../../events-config.json";

export const revalidate = 0;

export default async function EventsPage() {
  const { data: events } = await supabase.from("events").select("*").order("name");

  // Group by category from config
  const categoriesMap = new Map<string, any[]>();
  events?.forEach(event => {
    const configEvent = config.events.find(e => e.slug === event.slug);
    const cat = configEvent?.category || "Uncategorized";
    if (!categoriesMap.has(cat)) categoriesMap.set(cat, []);
    categoriesMap.get(cat)!.push(event);
  });
  
  const categoryOrder = [
    "Tiny Tots (Pre-KG, LKG, UKG)",
    "Energetic Kids (Classes I-III)",
    "Young Visionaries (Classes IV-VI)",
    "Emerging Stars (Classes VII-IX)",
    "Teen Trailblazers (Classes X-XII)",
    "Uncategorized"
  ];
  
  const categories = Array.from(categoriesMap.entries()).sort((a, b) => {
    let idxA = categoryOrder.indexOf(a[0]);
    let idxB = categoryOrder.indexOf(b[0]);
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });

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

        <div className="space-y-12">
          {categories.map(([category, catEvents]) => (
            <div key={category} className="animate-slide-up">
              <h2 className="text-xl lg:text-2xl font-bold text-onyx mb-6 pb-2 border-b border-gray-200">{category}</h2>
              <div className="flex flex-col gap-4">
                {catEvents.map((event) => (
                  <Link 
                    key={event.id} 
                    href={`/events/${event.slug}`}
                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-gold hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between text-left gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-5">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center group-hover:bg-gold-50 group-hover:border-gold/20 transition-colors">
                        <Trophy size={20} className="text-taupe group-hover:text-gold transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-onyx mb-1">{event.name}</h3>
                        <p className="text-taupe text-sm leading-relaxed max-w-xl">
                          {event.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-onyx sm:whitespace-nowrap mt-2 sm:mt-0 ml-16 sm:ml-0">
                      Judge this event
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {(!events || events.length === 0) && (
            <div className="py-20 text-center text-taupe border border-dashed border-gray-300 rounded-xl">
              No events found. Please run the seed script.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
