'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  XMarkIcon,
  CameraIcon,
  ArrowPathIcon,
  BoltIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { scanAudio } from '@/lib/pos/useBarcodeScannerWedge';

interface POSCameraBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function POSCameraBarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
}: POSCameraBarcodeScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isSubscribed = true;
    startScanning(isSubscribed);

    return () => {
      isSubscribed = false;
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.stop().catch(() => {});
      } catch {}
      html5QrCodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setTorchOn(false);
  };

  const startScanning = async (isSubscribed: boolean) => {
    setError(null);
    setIsScanning(true);

    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setError('Camera requires HTTPS. Please access this page over a secure HTTPS connection.');
      setIsScanning(false);
      return;
    }

    // Try HTML5-QRCode if dynamically available
    try {
      const html5QrCodeModule = await import('html5-qrcode').catch(() => null);
      if (html5QrCodeModule && isSubscribed) {
        const { Html5Qrcode } = html5QrCodeModule;
        const scannerId = 'pos-camera-scanner-viewport';
        
        // Ensure element is ready in DOM
        setTimeout(async () => {
          if (!isSubscribed) return;
          try {
            const scanner = new Html5Qrcode(scannerId);
            html5QrCodeRef.current = scanner;

            const config = {
              fps: 15,
              qrbox: { width: 260, height: 200 },
              aspectRatio: 1.0,
            };

            await scanner.start(
              { facingMode: 'environment' },
              config,
              (decodedText: string) => {
                scanAudio.playSuccess();
                onScan(decodedText.trim());
                onClose();
              },
              () => {} // Ignored per-frame decode miss
            );
          } catch (scannerErr: any) {
            console.warn('[CameraScanner] html5-qrcode fallback to native media stream:', scannerErr);
            fallbackNativeCamera(isSubscribed, scannerErr);
          }
        }, 150);
        return;
      }
    } catch {
      // Fallback to native camera stream
    }

    fallbackNativeCamera(isSubscribed);
  };

  const getCleanErrorMessage = (err: any) => {
    if (!err) return 'Unable to access device camera.';
    const name = err.name || '';
    const msg = err.message || '';
    if (name === 'NotAllowedError' || msg.includes('Permission denied') || msg.includes('Permission dismissed')) {
      return 'Camera permission was denied. Please allow camera access in your browser settings or address bar.';
    }
    if (name === 'NotFoundError' || msg.includes('not found') || msg.includes('DevicesNotFoundError')) {
      return 'No camera was found on this device.';
    }
    if (name === 'NotReadableError' || msg.includes('in use') || msg.includes('could not start')) {
      return 'Camera is in use by another application or tab.';
    }
    return msg || 'Unable to access device camera.';
  };

  const fallbackNativeCamera = async (isSubscribed: boolean, previousErr?: any) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser or requires HTTPS.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (!isSubscribed) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        setHasTorch(Boolean(capabilities.torch));
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Native BarcodeDetector API if available
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
          });

          const detectFrame = async () => {
            if (!videoRef.current || !isScanning) return;
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                scanAudio.playSuccess();
                onScan(code.trim());
                onClose();
                return;
              }
            } catch {}
            animationFrameRef.current = requestAnimationFrame(detectFrame);
          };

          animationFrameRef.current = requestAnimationFrame(detectFrame);
        }
      }
    } catch (err: any) {
      if (isSubscribed) {
        console.error('[CameraScanner] Error accessing camera:', err);
        setError(getCleanErrorMessage(err || previousErr));
        setIsScanning(false);
      }
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({ advanced: [{ torch: nextState }] });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Torch toggle failed:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <CameraIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Camera Barcode Scanner</h3>
          </div>
          <div className="flex items-center gap-1">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-1.5 rounded-xl border transition ${
                  torchOn
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Toggle Flashlight / Torch"
              >
                <BoltIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCANNER VIEWPORT */}
        <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
          <div id="pos-camera-scanner-viewport" className="w-full h-full" />
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />

          {/* RETICLE OVERLAY */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-48 border-2 border-indigo-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
              {/* Laser Line Animation */}
              <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-rose-500/80 shadow-[0_0_8px_#f43f5e] animate-pulse" />
            </div>
          </div>

          {error && (
            <div className="absolute inset-x-4 p-4 rounded-2xl bg-rose-950/95 border border-rose-800 text-center z-10 shadow-xl backdrop-blur-sm">
              <p className="text-xs font-bold text-rose-200">{error}</p>
              <p className="text-[11px] text-rose-300/80 mt-1">
                Please allow camera access in your browser or device settings.
              </p>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  startScanning(true);
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" />
                Retry Camera
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-300 font-semibold">Align barcode or QR code inside the box</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Scans automatically upon recognition</p>
        </div>
      </div>
    </div>
  );
}
