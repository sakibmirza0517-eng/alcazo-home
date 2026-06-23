"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Priya Sharma", role: "Homeowner, Gurugram", rating: 5, text: "Excellent service! The carpenter was professional and completed the work on time.", image: "https://i.pravatar.cc/150?img=47" },
  { name: "Rahul Verma", role: "Business Owner, Faridabad", rating: 5, text: "Found a great electrician through KaamWale. Very reliable service.", image: "https://i.pravatar.cc/150?img=33" },
  { name: "Anita Singh", role: "Homeowner, Rohtak", rating: 5, text: "The plumber fixed our leak quickly. Great experience!", image: "https://i.pravatar.cc/150?img=45" }
];

export default function TestimonialsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="badge badge-blue mb-4">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-4">What Our Customers Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-clean"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">"{testimonial.text}"</p>
              <div className="flex items-center">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}