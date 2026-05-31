"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

export function QRScanner({ onScan }: { onScan: (decodedText: string) => void }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          // Pause scanning once successfully decoded to prevent multiple scans
          if (scannerRef.current) {
             scannerRef.current.clear();
          }
          onScan(decodedText);
        },
        (errorMessage) => {
          // Ignore general scan errors (happens when no QR is in view)
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
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
