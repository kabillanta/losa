"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export function QRScanner({ onScan }: { onScan: (decodedText: string) => void }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Prevent multiple initializations
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
      
      scannerRef.current.start(
        { facingMode: "environment" }, // Forces rear camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Pause scanning once successfully decoded
          if (scannerRef.current) {
            scannerRef.current.stop().catch(console.error);
          }
          onScan(decodedText);
        },
        (errorMessage) => {
          // Ignore general scan errors (happens when no QR is in view)
        }
      ).catch((err) => {
        console.error("Failed to start scanner:", err);
        setError("Could not start camera. Please ensure permissions are granted.");
      });
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.error("Failed to stop scanner", e));
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div id="qr-reader" className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white"></div>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}
