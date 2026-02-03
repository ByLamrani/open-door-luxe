import { motion } from "framer-motion";
import lamraniSignatureImg from "@/assets/lamrani-signature.png";

const LamraniSignature = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.06 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
    >
      {/* Lamrani Signature Image as Background */}
      <img 
        src={lamraniSignatureImg}
        alt=""
        className="w-[60rem] md:w-[80rem] max-w-none select-none"
        style={{
          filter: "brightness(1.3) sepia(1) hue-rotate(15deg) saturate(2.5)",
        }}
      />
    </motion.div>
  );
};

export default LamraniSignature;
