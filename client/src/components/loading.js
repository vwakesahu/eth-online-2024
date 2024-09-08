import React from "react";
import { Skeleton } from "./ui/skeleton";
import { motion } from "framer-motion";

const Loading = () => {
  return (
    <section>
      <motion.div
        className="custom-screen py-28 text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-5 max-w-4xl mx-auto text-center">
          <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-4 w-2/3 mx-auto mb-2" />
          <Skeleton className="h-4 w-1/3 mx-auto mb-6" />

          <div className="flex items-center justify-center gap-x-3 font-medium text-sm">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Loading;
