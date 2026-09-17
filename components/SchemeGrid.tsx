"use client";

import { FC } from "react";
import SchemeCard from "./SchemeCard";
import ViewMoreButton from "./ViewMoreButton";
import { motion } from "framer-motion";

interface Scheme {
  id: number;
  title: string;
  ministry: string;
  description: string;
  imageUrl?: string | null;
}

interface SchemeGridProps {
  schemes: Scheme[];
}

const SchemeGrid: FC<SchemeGridProps> = ({ schemes }) => {
  return (
    <div className="flex overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 gap-4 scrollbar-hide pt-2 snap-x snap-mandatory scroll-pl-6">
      {schemes.map((scheme, index) => (
        <motion.div
          key={scheme.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="snap-start"
        >
          <SchemeCard {...scheme} />
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: schemes.length * 0.05 }}
        className="snap-start"
      >
        <ViewMoreButton />
      </motion.div>
    </div>
  );
};

export default SchemeGrid;
