import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const ImageViewer = ({ images, initialIndex, isOpen, onClose }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    reset();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    reset();
  };

  /** Zoom anchored on a point inside the stage (cursor or centre). */
  const zoomAt = useCallback((nextZoom: number, px?: number, py?: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    setZoom((z) => {
      const next = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      const k = next / z;
      setOffset((o) => {
        if (next === MIN_ZOOM) return { x: 0, y: 0 };
        const cx = px ?? (rect ? rect.width / 2 : 0);
        const cy = py ?? (rect ? rect.height / 2 : 0);
        return { x: cx - (cx - o.x) * k, y: cy - (cy - o.y) * k };
      });
      return next;
    });
  }, []);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  // Native, non-passive wheel listener so the page never scrolls behind the viewer
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !isOpen) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const rect = el.getBoundingClientRect();
      zoomAt(zoomRef.current * Math.exp(-dy * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isOpen, zoomAt, currentIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomAt(zoomRef.current * 1.3);
      if (e.key === "-") zoomAt(zoomRef.current / 1.3);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, images.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom === 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setOffset({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 bg-card border border-border rounded-full text-foreground hover:text-gold hover:border-gold transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Zoom controls */}
          <div
            className="absolute top-4 left-4 flex items-center gap-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => zoomAt(zoom / 1.4)}
              className="p-3 bg-card border border-border rounded-full text-foreground hover:text-gold hover:border-gold transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => zoomAt(zoom * 1.4)}
              className="p-3 bg-card border border-border rounded-full text-foreground hover:text-gold hover:border-gold transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={reset}
              className="p-3 bg-card border border-border rounded-full text-foreground hover:text-gold hover:border-gold transition-colors"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <span className="px-3 py-2 bg-card border border-border rounded-full text-xs font-body text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 md:left-8 p-3 bg-card border border-border rounded-full text-foreground hover:text-gold hover:border-gold transition-colors z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 md:right-8 p-3 bg-card border border-border rounded-full text-foreground hover:text-gold hover:border-gold transition-colors z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Main Image */}
          <div
            ref={stageRef}
            className="relative w-[90vw] h-[85vh] overflow-hidden flex items-center justify-center touch-none"
            style={{ cursor: zoom > 1 ? (dragRef.current ? "grabbing" : "grab") : "zoom-in" }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => {
              const rect = stageRef.current!.getBoundingClientRect();
              zoomAt(zoom > 1 ? 1 : 2.5, e.clientX - rect.left, e.clientY - rect.top);
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              draggable={false}
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                transition: dragRef.current ? "none" : "transform 0.08s linear",
              }}
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-card border border-border rounded-full z-20">
            <span className="font-body text-sm text-muted-foreground">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Thumbnail Strip */}
          <div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  reset();
                }}
                className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                  currentIndex === i ? "border-gold" : "border-border hover:border-gold/50"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageViewer;
