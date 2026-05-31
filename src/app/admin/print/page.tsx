"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";
import Link from "next/link";
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type School = {
  id: string;
  name: string;
  teacher_name: string | null;
  qr_code_id: string;
};

export default function PrintQRCodes() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function fetchSchools() {
      const { data } = await supabase.from("schools").select("*").order("name");
      if (data) setSchools(data);
      setLoading(false);
    }
    fetchSchools();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();

      for (const school of schools) {
        const canvas = document.getElementById(`qr-canvas-${school.id}`) as HTMLCanvasElement;
        if (canvas) {
          const dataUrl = canvas.toDataURL("image/png");
          // Remove the "data:image/png;base64," prefix
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          
          // Sanitize filename
          const filename = `${school.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
          zip.file(filename, base64Data, { base64: true });
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "losa-qrcodes.zip");
    } catch (error) {
      console.error("Failed to generate zip:", error);
      alert("Failed to download QR codes. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-taupe">Loading QR Codes...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      {/* Non-printable controls */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-4 border-b border-gray-200 pb-6">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors mb-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-onyx tracking-tight">Print QR Codes</h1>
          <p className="text-sm text-taupe mt-1">Press the print button to save as PDF, or download them all as a ZIP file.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 bg-white text-onyx border border-gray-200 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Download ZIP
          </button>
          <button 
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-onyx text-white font-medium px-6 py-2.5 rounded-lg hover:bg-black transition-colors shadow-sm"
          >
            <Printer size={18} />
            Print to PDF
          </button>
        </div>
      </div>

      {/* Printable Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 print:grid-cols-3 print:gap-12 print:px-0">
        {schools.map((school) => (
          <div 
            key={school.id} 
            className="flex flex-col items-center justify-center border-2 border-gray-100 rounded-2xl p-6 text-center shadow-sm bg-white print:break-inside-avoid print:shadow-none print:border-gray-300"
          >
            <div className="mb-4">
              <QRCodeCanvas 
                id={`qr-canvas-${school.id}`}
                value={school.qr_code_id} 
                size={180} 
                level="M" 
                includeMargin={false}
              />
            </div>
            <h2 className="text-lg font-bold text-onyx leading-tight mt-2">{school.name}</h2>
            {school.teacher_name && (
              <p className="text-sm font-medium text-taupe mt-1 border-t border-gray-100 pt-2 w-full">
                {school.teacher_name}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2 font-mono">{school.qr_code_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
