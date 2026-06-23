"use client";

import { motion } from "framer-motion";
import { Users, CheckCircle, MapPin, Star } from "lucide-react";

const stats = [
  { label: "Workers Registered", value: "5,000+", icon: Users },
  { label: "Jobs Completed", value: "25,000+", icon: CheckCircle },
  { label: "Cities Covered", value: "50+", icon: MapPin },
  { label: "Customer Satisfaction", value: "98%", icon: Star }
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-blue-100 text-sm sm:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}