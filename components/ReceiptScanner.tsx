'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { scanReceipt } from '@/lib/ai/ocr';
import { Button } from './ui/Button';
import { Camera, Upload, Loader, X } from 'lucide-react';

interface ReceiptScannerProps {
  onScanned: (data: {
    merchant?: string;
    amount?: number;
    date?: Date;
    notes: string;
  }) => void;
}

export function ReceiptScanner({ onScanned }: ReceiptScannerProps) {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setScanning(true);
    setError('');

    try {
      const result = await scanReceipt(file);

      if (result.amount) {
        onScanned({
          merchant: result.merchant,
          amount: result.amount,
          date: result.date,
          notes: result.merchant 
            ? `${result.merchant} - ${result.rawText.substring(0, 50)}` 
            : result.rawText.substring(0, 100)
        });
      } else {
        setError(t.ai.couldNotParse);
      }
    } catch (err) {
      console.error('Receipt scan error:', err);
      setError(t.ai.scanFailed);
    } finally {
      setScanning(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setStream(mediaStream);
      setCameraActive(true);
      setError('');
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        stopCamera();
        
        // Create File from blob
        const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
        await handleFileSelect(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="w-5 h-5 text-blue-500" />
        <h3 className="font-medium text-gray-900">{t.ai.scanReceipt}</h3>
      </div>

      {cameraActive ? (
        <div className="space-y-3">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              playsInline
            />
            <button
              onClick={stopCamera}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="flex gap-2">
            <Button
              onClick={capturePhoto}
              disabled={scanning}
              className="flex-1"
            >
              {scanning ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {t.ai.scanningReceipt}
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </>
              )}
            </Button>
            <Button
              onClick={stopCamera}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex gap-2">
            <Button
              onClick={startCamera}
              disabled={scanning}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Open Camera
            </Button>
            <Button
              onClick={handleUploadClick}
              disabled={scanning}
              variant="secondary"
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
