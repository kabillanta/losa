"use client";

import { motion } from "motion/react";

export function FeatureBento() {
  return (
    <section className="py-24 md:py-32 bg-gray-50 text-onyx px-6 lg:px-12 max-w-screen-2xl mx-auto">
      <div className="mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Everything you need, <br className="hidden md:block" />
          in one simple workflow.
        </h2>
        <p className="text-taupe text-lg max-w-[50ch]">
          A unified portal for teachers to manage participation effortlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
        {/* Cell 1: Large (3 columns wide) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-3 bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col justify-end min-h-[300px] md:min-h-[400px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-onyx text-white rounded-xl flex items-center justify-center mb-6 text-xl font-bold shadow-lg">
              1
            </div>
            <h3 className="text-2xl font-bold mb-3">Create Profile</h3>
            <p className="text-taupe max-w-sm">
              Sign in and provide your basic school details to instantly unlock access to the management dashboard.
            </p>
          </div>
        </motion.div>

        {/* Cell 2: Tall (2 columns wide, spans 2 rows conceptually if we had them, but here just right side) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-2 bg-onyx text-white rounded-3xl p-8 md:p-12 shadow-md flex flex-col justify-end min-h-[300px] md:min-h-[400px] relative overflow-hidden group"
        >
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           
           <div className="relative z-10">
            <div className="w-12 h-12 bg-gold text-onyx rounded-xl flex items-center justify-center mb-6 text-xl font-bold shadow-lg shadow-gold/20">
              2
            </div>
            <h3 className="text-2xl font-bold mb-3">Add Students</h3>
            <p className="text-gray-400">
              Select events from the categorized list and securely assign your students into the required team sizes.
            </p>
          </div>
        </motion.div>

        {/* Cell 3: Wide (full width) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-5 bg-taupe text-white border border-taupe-light rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 min-h-[200px]"
        >
          <div className="max-w-xl">
            <div className="w-12 h-12 bg-white text-taupe rounded-xl flex items-center justify-center mb-6 text-xl font-bold shadow-sm">
              3
            </div>
            <h3 className="text-2xl font-bold mb-3">Get Your Pass</h3>
            <p className="text-taupe-light">
              This will be sent via mail a few days before the event for an easy and seamless entry process.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
