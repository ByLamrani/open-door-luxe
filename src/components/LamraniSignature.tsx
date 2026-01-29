import { motion } from "framer-motion";
import lamraniSignature from "@/assets/lamrani-signature.png";

const LamraniSignature = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.08 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
    >
      <img
        src={lamraniSignature}
        alt=""
        className="w-[80%] max-w-[800px] h-auto object-contain opacity-100 select-none"
        style={{
          filter: "invert(1) brightness(1.2)",
        }}
      />
    </motion.div>
  );
};

export default LamraniSignature;
