import { motion } from "framer-motion";

const LamraniSignature = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.08 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
    >
      {/* Text-based Lamrani with same styling as hero */}
      <h2 
        className="font-display text-[20rem] md:text-[30rem] italic select-none"
        style={{
          background: "linear-gradient(135deg, #C4A052 0%, #E8D5A3 50%, #C4A052 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          opacity: 1,
        }}
      >
        Lamrani
      </h2>
    </motion.div>
  );
};

export default LamraniSignature;
