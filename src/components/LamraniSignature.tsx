import { motion } from "framer-motion";
import lamraniSignatureImg from "@/assets/lamrani-signature.png";

const LamraniSignature = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.08 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden -translate-y-8"
    >
      {/* Lamrani Signature Image as Background */}
      <img 
        src={lamraniSignatureImg}
        alt=""
        className="w-[80rem] md:w-[100rem] lg:w-[120rem] max-w-none select-none"
        style={{
          filter: "brightness(1.3) sepia(1) hue-rotate(15deg) saturate(2.5)",
        }}
      />
    </motion.div>
  );
};

export default LamraniSignature;
