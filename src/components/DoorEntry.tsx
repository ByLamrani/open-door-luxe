import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import MoroccanDoor from "./MoroccanDoor";

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
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
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
        <div className="relative" style={{ perspective: "1500px", transformStyle: "preserve-3d" }}>
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

          {/* Inside the door - the room beyond (always visible behind door) */}
          <div className="absolute inset-0 rounded-t-[70px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-900/80 via-amber-950 to-charcoal" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0.3 }}
              animate={isOpening ? { opacity: 1 } : { opacity: 0.3 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="text-center">
                <motion.div
                  animate={isOpening ? { scale: [1, 1.1, 1], opacity: 1 } : { opacity: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <span className="text-gold font-display text-3xl md:text-4xl drop-shadow-lg">Welcome</span>
                </motion.div>
                <motion.p
                  className="text-gold/60 font-body text-sm mt-2"
                  animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  to a world of luxury
                </motion.p>
              </div>
            </motion.div>
            {/* Light rays coming from inside */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse at center, hsl(43 56% 55% / 0.3) 0%, transparent 70%)"
              }}
              animate={isOpening ? { opacity: [0, 0.8, 0.5] } : { opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
          </div>

          {/* The Custom Moroccan Door - positioned on top */}
          <div className="relative z-10">
            <MoroccanDoor isOpening={isOpening} />
          </div>
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
