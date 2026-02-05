 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { X, ChevronLeft, ChevronRight } from "lucide-react";
 
 interface ImageViewerProps {
   images: string[];
   initialIndex: number;
   isOpen: boolean;
   onClose: () => void;
 }
 
 const ImageViewer = ({ images, initialIndex, isOpen, onClose }: ImageViewerProps) => {
   const [currentIndex, setCurrentIndex] = useState(initialIndex);
 
   const handlePrev = () => {
     setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
   };
 
   const handleNext = () => {
     setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
   };
 
   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === "ArrowLeft") handlePrev();
     if (e.key === "ArrowRight") handleNext();
     if (e.key === "Escape") onClose();
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
           onKeyDown={handleKeyDown}
           tabIndex={0}
         >
           {/* Close Button */}
           <button
             onClick={onClose}
             className="absolute top-4 right-4 p-3 bg-card border border-border rounded-full text-foreground hover:text-gold hover:border-gold transition-colors z-10"
           >
             <X className="w-6 h-6" />
           </button>
 
           {/* Navigation Buttons */}
           <button
             onClick={(e) => {
               e.stopPropagation();
               handlePrev();
             }}
             className="absolute left-4 md:left-8 p-3 bg-card border border-border rounded-full text-foreground hover:text-gold hover:border-gold transition-colors z-10"
           >
             <ChevronLeft className="w-6 h-6" />
           </button>
 
           <button
             onClick={(e) => {
               e.stopPropagation();
               handleNext();
             }}
             className="absolute right-4 md:right-8 p-3 bg-card border border-border rounded-full text-foreground hover:text-gold hover:border-gold transition-colors z-10"
           >
             <ChevronRight className="w-6 h-6" />
           </button>
 
           {/* Main Image */}
           <motion.div
             key={currentIndex}
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.9 }}
             transition={{ duration: 0.2 }}
             className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
             onClick={(e) => e.stopPropagation()}
           >
             <img
               src={images[currentIndex]}
               alt={`Image ${currentIndex + 1}`}
               className="max-w-full max-h-[85vh] object-contain rounded-lg"
             />
           </motion.div>
 
           {/* Image Counter */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-card border border-border rounded-full">
             <span className="font-body text-sm text-muted-foreground">
               {currentIndex + 1} / {images.length}
             </span>
           </div>
 
           {/* Thumbnail Strip */}
           <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2">
             {images.map((img, i) => (
               <button
                 key={i}
                 onClick={(e) => {
                   e.stopPropagation();
                   setCurrentIndex(i);
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