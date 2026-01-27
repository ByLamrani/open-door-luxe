import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moroccanDoor from "@/assets/moroccan-door.jpg";
import logo from "@/assets/logo.png";

interface DoorEntryProps {
  onEnter: () => void;
}

const DoorEntry = ({ onEnter }: DoorEntryProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const handleDoorClick = () => {
    setShowHint(false);
    setIsOpening(true);
    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-background to-charcoal-light" />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "var(--gradient-radial-gold)" }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Logo above door */}
      <motion.div
        className="absolute top-8 md:top-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <img 
          src={logo} 
          alt="ale LifeStyle" 
          className="h-20 md:h-28 w-auto object-contain drop-shadow-2xl"
        />
      </motion.div>

      {/* Door Container */}
      <motion.div
        className="relative cursor-pointer group"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        onClick={handleDoorClick}
      >
        {/* Door Frame */}
        <div className="relative" style={{ perspective: "1500px" }}>
          {/* Outer glow effect */}
          <motion.div
            className="absolute -inset-4 rounded-t-[80px] opacity-50"
            style={{ background: "var(--gradient-radial-gold)" }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />

          {/* Door Frame Border */}
          <div className="absolute -inset-3 rounded-t-[75px] border-2 border-gold/30 bg-gradient-to-b from-gold/10 to-transparent" />

          {/* The Door */}
          <motion.div
            className="relative w-[280px] md:w-[320px] h-[450px] md:h-[520px] rounded-t-[70px] overflow-hidden shadow-2xl origin-left"
            animate={isOpening ? {
              rotateY: -105,
              transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
            } : {}}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Door Image */}
            <img
              src={moroccanDoor}
              alt="Enter ale LifeStyle"
              className="w-full h-full object-cover"
            />

            {/* Door overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-charcoal/20" />

            {/* Hover shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-0 group-hover:opacity-100"
              initial={false}
              animate={showHint ? { x: ["-100%", "100%"] } : {}}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />

            {/* Door handle glow */}
            <motion.div
              className="absolute top-1/2 right-8 w-6 h-6 rounded-full bg-gold/60"
              animate={{
                boxShadow: [
                  "0 0 10px hsl(43 56% 55% / 0.4)",
                  "0 0 25px hsl(43 56% 55% / 0.8)",
                  "0 0 10px hsl(43 56% 55% / 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Inside the door (revealed when opening) */}
          <AnimatePresence>
            {isOpening && (
              <motion.div
                className="absolute inset-0 rounded-t-[70px] bg-gradient-to-b from-gold/20 via-gold/10 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <span className="text-gold font-display text-2xl">Welcome...</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Click hint */}
        <AnimatePresence>
          {showHint && !isOpening && (
            <motion.div
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <motion.p
                className="text-gold/80 font-body text-sm tracking-widest uppercase"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Click to Enter
              </motion.p>
              <motion.div
                className="mt-2 mx-auto w-px h-8 bg-gradient-to-b from-gold/60 to-transparent"
                animate={{ scaleY: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Decorative corners */}
      <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-gold/30" />
      <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-gold/30" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-gold/30" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-gold/30" />
    </div>
  );
};

export default DoorEntry;
