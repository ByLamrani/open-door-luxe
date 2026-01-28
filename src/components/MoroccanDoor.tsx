import { motion } from "framer-motion";

const MoroccanDoor = ({ isOpening }: { isOpening: boolean }) => {
  return (
    <motion.div
      className="relative w-[280px] md:w-[320px] h-[450px] md:h-[520px] origin-left"
      animate={isOpening ? {
        rotateY: -105,
        transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
      } : {}}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Door base - rich wood */}
      <div className="absolute inset-0 rounded-t-[70px] bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 shadow-2xl overflow-hidden">
        
        {/* Decorative arch top frame */}
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 320 520" preserveAspectRatio="none">
          {/* Outer arch frame */}
          <path 
            d="M10 520 L10 150 Q10 10 160 10 Q310 10 310 150 L310 520" 
            fill="none" 
            stroke="hsl(43 56% 55%)" 
            strokeWidth="8"
            className="drop-shadow-lg"
          />
          
          {/* Inner arch frame */}
          <path 
            d="M30 510 L30 160 Q30 40 160 40 Q290 40 290 160 L290 510" 
            fill="none" 
            stroke="hsl(43 56% 45%)" 
            strokeWidth="4"
          />
          
          {/* Central geometric star pattern */}
          <g transform="translate(160, 220)">
            {/* 8-pointed star */}
            <polygon 
              points="0,-60 17,-17 60,0 17,17 0,60 -17,17 -60,0 -17,-17" 
              fill="none" 
              stroke="hsl(43 56% 55%)" 
              strokeWidth="2"
            />
            <polygon 
              points="0,-45 12.7,-12.7 45,0 12.7,12.7 0,45 -12.7,12.7 -45,0 -12.7,-12.7" 
              fill="hsl(43 56% 55% / 0.2)" 
              stroke="hsl(43 56% 60%)" 
              strokeWidth="1.5"
            />
            <circle cx="0" cy="0" r="15" fill="none" stroke="hsl(43 56% 55%)" strokeWidth="2" />
            <circle cx="0" cy="0" r="8" fill="hsl(43 56% 55% / 0.4)" stroke="hsl(43 56% 60%)" strokeWidth="1" />
          </g>
          
          {/* Top arch decoration - zellige pattern */}
          <g transform="translate(160, 90)">
            <polygon points="0,-35 10,-10 35,0 10,10 0,35 -10,10 -35,0 -10,-10" fill="none" stroke="hsl(43 56% 55%)" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="10" fill="hsl(43 56% 55% / 0.3)" stroke="hsl(43 56% 55%)" strokeWidth="1" />
          </g>
          
          {/* Side geometric patterns - left */}
          <g transform="translate(50, 320)">
            <rect x="-15" y="-15" width="30" height="30" fill="none" stroke="hsl(43 56% 50%)" strokeWidth="1.5" transform="rotate(45)" />
            <rect x="-10" y="-10" width="20" height="20" fill="hsl(43 56% 55% / 0.2)" stroke="hsl(43 56% 55%)" strokeWidth="1" transform="rotate(45)" />
          </g>
          <g transform="translate(50, 400)">
            <rect x="-15" y="-15" width="30" height="30" fill="none" stroke="hsl(43 56% 50%)" strokeWidth="1.5" transform="rotate(45)" />
            <rect x="-10" y="-10" width="20" height="20" fill="hsl(43 56% 55% / 0.2)" stroke="hsl(43 56% 55%)" strokeWidth="1" transform="rotate(45)" />
          </g>
          
          {/* Side geometric patterns - right */}
          <g transform="translate(270, 320)">
            <rect x="-15" y="-15" width="30" height="30" fill="none" stroke="hsl(43 56% 50%)" strokeWidth="1.5" transform="rotate(45)" />
            <rect x="-10" y="-10" width="20" height="20" fill="hsl(43 56% 55% / 0.2)" stroke="hsl(43 56% 55%)" strokeWidth="1" transform="rotate(45)" />
          </g>
          <g transform="translate(270, 400)">
            <rect x="-15" y="-15" width="30" height="30" fill="none" stroke="hsl(43 56% 50%)" strokeWidth="1.5" transform="rotate(45)" />
            <rect x="-10" y="-10" width="20" height="20" fill="hsl(43 56% 55% / 0.2)" stroke="hsl(43 56% 55%)" strokeWidth="1" transform="rotate(45)" />
          </g>
          
          {/* Decorative border lines */}
          <line x1="80" y1="480" x2="80" y2="300" stroke="hsl(43 56% 45%)" strokeWidth="1" />
          <line x1="240" y1="480" x2="240" y2="300" stroke="hsl(43 56% 45%)" strokeWidth="1" />
          
          {/* Bottom panel decorations */}
          <rect x="95" y="380" width="130" height="90" rx="5" fill="none" stroke="hsl(43 56% 50%)" strokeWidth="2" />
          <rect x="105" y="390" width="110" height="70" rx="3" fill="hsl(43 56% 55% / 0.1)" stroke="hsl(43 56% 55%)" strokeWidth="1" />
        </svg>
        
        {/* Wood grain texture overlay */}
        <div className="absolute inset-0 opacity-30" 
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 69, 19, 0.1) 2px,
              rgba(139, 69, 19, 0.1) 4px
            )`
          }}
        />
        
        {/* Door knocker ring - left side */}
        <div className="absolute top-1/2 left-12 -translate-y-1/2">
          <motion.div 
            className="w-10 h-10 rounded-full border-4 border-gold bg-gradient-to-br from-gold-light to-gold-dark shadow-lg"
            animate={{ 
              boxShadow: [
                "0 0 10px hsl(43 56% 55% / 0.4)",
                "0 0 20px hsl(43 56% 55% / 0.6)",
                "0 0 10px hsl(43 56% 55% / 0.4)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-900" />
          </motion.div>
        </div>
        
        {/* Door handle - right side */}
        <motion.div
          className="absolute top-1/2 right-8 -translate-y-1/2 w-6 h-12 rounded-full bg-gradient-to-b from-gold-light via-gold to-gold-dark shadow-xl"
          animate={{
            boxShadow: [
              "0 0 10px hsl(43 56% 55% / 0.4)",
              "0 0 25px hsl(43 56% 55% / 0.8)",
              "0 0 10px hsl(43 56% 55% / 0.4)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Ambient lighting effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 rounded-t-[70px]" />
        
        {/* Highlight on arch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-white/10 to-transparent rounded-t-[60px]" />
      </div>
    </motion.div>
  );
};

export default MoroccanDoor;
