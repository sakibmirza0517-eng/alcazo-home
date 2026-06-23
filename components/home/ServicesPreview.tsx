"use client";

import Link from "next/link";
import { ArrowRight, Hammer, Droplets, Zap, Paintbrush, Wind, Home, Wrench, Package, Ruler, Settings } from "lucide-react";

const services = [
  { name: "Carpenter", slug: "Carpenter", desc: "Furniture, doors & custom woodwork", icon: Hammer, color: "#d97706", bg: "#fef3c7" },
  { name: "Plumber", slug: "Plumber", desc: "Pipes, taps, leaks & bathroom fittings", icon: Droplets, color: "#3b82f6", bg: "#dbeafe" },
  { name: "Electrician", slug: "Electrician", desc: "Wiring, switches, fans & AC electrical", icon: Zap, color: "#eab308", bg: "#fef9c3" },
  { name: "Painter", slug: "Painter", desc: "Interior & exterior painting services", icon: Paintbrush, color: "#ec4899", bg: "#fce7f3" },
  { name: "AC Service", slug: "AC Service", desc: "Installation, gas filling & repair", icon: Wind, color: "#06b6d4", bg: "#cffafe" },
  { name: "Interior Design", slug: "Interior Design", desc: "Modular kitchen & home interiors", icon: Home, color: "#a855f7", bg: "#f3e8ff" },
  { name: "Furniture Repair", slug: "Furniture Repair", desc: "Sofa, chair, table repair & polishing", icon: Wrench, color: "#f97316", bg: "#ffedd5" },
  { name: "Pest Control", slug: "Pest Control", desc: "Termite, cockroach & pest removal", icon: Package, color: "#22c55e", bg: "#dcfce7" },
  { name: "Tile & Flooring", slug: "Tile & Flooring", desc: "Floor tiles, marble & granite work", icon: Ruler, color: "#78716c", bg: "#f5f5f4" },
  { name: "General Repair", slug: "General Repair", desc: "Door locks, hinges & small fixes", icon: Settings, color: "#64748b", bg: "#f1f5f9" }
];

export default function ServicesPreview() {
  return (
    <section style={{
      padding: '80px 20px',
      background: 'white'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#111827'
          }}>
            Our Professional <span style={{ color: '#d97706' }}>Services</span>
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '640px', margin: '0 auto' }}>
            Expert solutions for every home need in Karnal. Quality workmanship guaranteed.
          </p>
        </div>

        {/* Services Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          {services.map((service, index) => (
            <Link
              key={service.name}
              href={`/professionals?service=${service.slug}`}
              style={{
                display: 'block',
                padding: '32px 24px',
                background: 'white',
                border: '2px solid #f3f4f6',
                borderRadius: '20px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(217, 119, 6, 0.15)';
                e.currentTarget.style.borderColor = '#fbbf24';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#f3f4f6';
              }}
            >
              {/* Icon */}
              <div style={{
                width: '64px',
                height: '64px',
                background: service.bg,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <service.icon size={32} color={service.color} />
              </div>

              {/* Service Name */}
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '8px'
              }}>
                {service.name}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.5',
                marginBottom: '16px'
              }}>
                {service.desc}
              </p>

              {/* Book Now */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#d97706',
                fontWeight: '700',
                fontSize: '0.875rem'
              }}>
                <span>View Professionals</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}