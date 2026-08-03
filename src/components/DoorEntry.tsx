import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/lamralux-mark.png";
import doorLeft from "@/assets/door-left.jpg";
import doorRight from "@/assets/door-right.jpg";

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
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
      {/* Background */}
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
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            }}
            animate={{ y: [null, -100], opacity: [0, 1, 0] }}
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
        className="absolute top-8 md:top-12 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <img
          src={logo}
          alt="Lamra Lux"
          className="h-20 md:h-28 w-auto object-contain drop-shadow-2xl rounded-md"
        />
      </motion.div>

      {/* Door Container */}
      <motion.div
        className="relative cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        onClick={handleDoorClick}
        style={{ perspective: "2000px" }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute -inset-6 opacity-40 blur-xl"
          style={{ background: "var(--gradient-radial-gold)" }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Main door assembly */}
        <div className="relative w-[320px] h-[480px] sm:w-[400px] sm:h-[600px] md:w-[500px] md:h-[750px]">

          {/* "Welcome" content behind the doors */}
          <div className="absolute inset-0 flex items-center justify-center z-0 bg-gradient-to-b from-amber-900/90 via-amber-950 to-[hsl(var(--charcoal))]">
            <motion.div
              className="text-center"
              animate={isOpening ? { opacity: 1, scale: 1.05 } : { opacity: 0.3 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <span className="text-gold font-display text-3xl md:text-5xl drop-shadow-lg">
                Welcome
              </span>
              <motion.p
                className="text-gold/60 font-body text-sm mt-2"
                animate={isOpening ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                to a world of luxury
              </motion.p>
            </motion.div>
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, hsl(43 56% 55% / 0.3) 0%, transparent 70%)",
              }}
              animate={isOpening ? { opacity: [0, 0.8, 0.5] } : { opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
          </div>

          {/* STATIC TEAL FRAME — stays in place when doors open */}
          {/* Left teal frame strip */}
          <div className="absolute left-0 top-0 bottom-0 z-30 pointer-events-none" style={{ width: "50%" }}>
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={doorLeft}
                alt=""
                className="absolute top-0 left-0 h-full object-cover object-left"
                style={{ width: "200%", clipPath: "inset(0 60% 0 0)" }}
                draggable={false}
              />
            </div>
          </div>
          {/* Right teal frame strip */}
          <div className="absolute right-0 top-0 bottom-0 z-30 pointer-events-none" style={{ width: "50%" }}>
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={doorRight}
                alt=""
                className="absolute top-0 right-0 h-full object-cover object-right"
                style={{ width: "200%", clipPath: "inset(0 0 0 60%)" }}
                draggable={false}
              />
            </div>
          </div>

          {/* TOP DECORATIVE STRIP — the top zellige tiles above the arch, stays static */}
          <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none" style={{ height: "8%" }}>
            <div className="flex w-full h-full">
              <div className="w-1/2 h-full overflow-hidden">
                <img
                  src={doorLeft}
                  alt=""
                  className="w-full h-auto object-cover object-top"
                  style={{ clipPath: "inset(0 0 90% 0)" }}
                  draggable={false}
                />
              </div>
              <div className="w-1/2 h-full overflow-hidden">
                <img
                  src={doorRight}
                  alt=""
                  className="w-full h-auto object-cover object-top"
                  style={{ clipPath: "inset(0 0 90% 0)" }}
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* LEFT DOOR PANEL — the wooden carved part, swings open to the left */}
          <motion.div
            className="absolute top-0 bottom-0 z-20 overflow-hidden"
            style={{
              left: "0",
              width: "50%",
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
            }}
            animate={
              isOpening
                ? { rotateY: -105, transition: { duration: 1.4, ease: [0.4, 0, 0.2, 1] } }
                : {}
            }
          >
            <img
              src={doorLeft}
              alt="Left door"
              className="absolute top-0 left-0 h-full object-cover object-right"
              style={{ width: "200%" }}
              draggable={false}
            />
          </motion.div>

          {/* RIGHT DOOR PANEL — the wooden carved part, swings open to the right */}
          <motion.div
            className="absolute top-0 bottom-0 z-20 overflow-hidden"
            style={{
              right: "0",
              width: "50%",
              transformOrigin: "right center",
              transformStyle: "preserve-3d",
            }}
            animate={
              isOpening
                ? { rotateY: 105, transition: { duration: 1.4, ease: [0.4, 0, 0.2, 1] } }
                : {}
            }
          >
            <img
              src={doorRight}
              alt="Right door"
              className="absolute top-0 right-0 h-full object-cover object-left"
              style={{ width: "200%" }}
              draggable={false}
            />
          </motion.div>
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
