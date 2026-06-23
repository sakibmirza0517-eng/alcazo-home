"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Users, CheckCircle, Star, ArrowRight } from "lucide-react";

const steps = [
  { 
    number: 1, 
    title: "Submit Request", 
    description: "Choose your service and describe your needs",
    icon: FileText,
    color: "#d97706",
    bg: "#fef3c7"
  },
  { 
    number: 2, 
    title: "Get Matched", 
    description: "We connect you with verified experts near you",
    icon: Users,
    color: "#3b82f6",
    bg: "#dbeafe"
  },
  { 
    number: 3, 
    title: "Work Done", 
    description: "Professional completes the job at your location",
    icon: CheckCircle,
    color: "#22c55e",
    bg: "#dcfce7"
  },
  { 
    number: 4, 
    title: "Rate & Review", 
    description: "Share your feedback and help others",
    icon: Star,
    color: "#eab308",
    bg: "#fef9c3"
  }
];

export default function HowItWorks() {
  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(180deg, #ffffff 0%, #fffbeb 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorations */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '-100px',
        width: '300px',
        height: '300px',
        background: 'rgba(217, 119, 6, 0.05)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '-100px',
        width: '300px',
        height: '300px',
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            background: 'rgba(217, 119, 6, 0.1)',
            border: '2px solid rgba(217, 119, 6, 0.3)',
            borderRadius: '50px',
            marginBottom: '20px',
            fontWeight: '700',
            color: '#92400e',
            fontSize: '0.875rem'
          }}>
            <Star size={16} color="#d97706" />
            Simple Process
          </div>
          
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#111827'
          }}>
            How It <span style={{ color: '#d97706' }}>Works</span>
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '640px', margin: '0 auto' }}>
            Get your work done in 4 simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '32px',
          position: 'relative'
        }}>
          {steps.map((step, index) => (
            <div
              key={step.number}
              style={{
                position: 'relative',
                background: 'white',
                border: '2px solid #f3f4f6',
                borderRadius: '24px',
                padding: '40px 32px',
                textAlign: 'center',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(217, 119, 6, 0.25)';
                e.currentTarget.style.borderColor = step.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#f3f4f6';
              }}
            >
              {/* Number Badge */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.125rem',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
                border: '4px solid white'
              }}>
                {step.number}
              </div>

              {/* Icon Container */}
              <div style={{
                width: '80px',
                height: '80px',
                background: step.bg,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '20px auto 24px',
                transition: 'all 0.3s ease'
              }}>
                <step.icon size={40} color={step.color} />
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '1.375rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '12px'
              }}>
                {step.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '0.95rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginTop: '64px' }}>
          <Link
            href="/book"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 40px',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: 'white',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '1.125rem',
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(217, 119, 6, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <span>Get Started Now</span>
            <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </section>
  );
}