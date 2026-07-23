import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Hash, Building2 } from "lucide-react";
import { fetchAllRows } from "@/lib/utils";

export const revalidate = 0;

export default async function LotsMappingPage() {
  const schools = await fetchAllRows(supabase, "schools") || [];

  // Sort schools by lot_number if they have one, then alphabetically
  const sortedSchools = schools.sort((a: any, b: any) => {
    if (a.lot_number !== null && b.lot_number !== null) {
      return a.lot_number - b.lot_number;
    }
    if (a.lot_number !== null) return -1;
    if (b.lot_number !== null) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-6 animate-slide-up">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-onyx tracking-tight">Lot Number Directory</h1>
        <p className="text-taupe mt-2">Master list mapping Lot Numbers to their respective Schools.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm uppercase tracking-wider text-taupe font-semibold">
                <th className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-2"><Hash size={16}/> Lot Number</div></th>
                <th className="px-6 py-4"><div className="flex items-center gap-2"><Building2 size={16}/> School Name</div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedSchools.map((school: any) => (
                <tr key={school.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {school.lot_number ? (
                      <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 bg-onyx text-white rounded-lg font-bold">
                        {school.lot_number}
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 bg-gray-100 text-taupe rounded-md text-xs font-medium uppercase tracking-wider">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${school.lot_number ? 'text-onyx' : 'text-gray-400'}`}>
                      {school.name}
                    </span>
                  </td>
                </tr>
              ))}
              
              {sortedSchools.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-taupe">
                    No schools registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
