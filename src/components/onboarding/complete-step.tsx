"use client";

import { motion } from "framer-motion";

export function CompleteStep() {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="text-center space-y-6"
    >
      <motion.div
        className="text-8xl"
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        🍞
      </motion.div>
      <h2 className="text-3xl font-bold text-crust">You're all set!</h2>
      <p className="text-xl text-chocolate/70">
        Tap your bread to start earning.
      </p>
      <p className="text-golden font-medium">Rise and grind.</p>
    </motion.div>
  );
}
