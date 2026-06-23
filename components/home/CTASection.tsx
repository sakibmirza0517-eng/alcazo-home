"use client";

import Link from "next/link";
import { Briefcase, ArrowRight, Users, TrendingUp, Shield } from "lucide-react";

export default function CTASection() {
  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'rgba(251, 191, 36, 0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        background: 'rgba(251, 191, 36, 0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Briefcase size={40} color="#fbbf24" />
        </div>

        {/* Heading */}
        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: '800',
          marginBottom: '16px',
          color: 'white',
          lineHeight: '1.2'
        }}>
          Are You a Skilled
          <br />
          <span style={{ color: '#fcd34d' }}>Professional?</span>
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '40px',
          maxWidth: '700px',
          margin: '0 auto 40px',
          lineHeight: '1.6'
        }}>
          Join Alcazo and get connected with thousands of customers in Karnal. 
          Grow your business with us!
        </p>

        {/* Benefits */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '48px'
        }}>
          {[
            { icon: Users, text: "Get More Customers" },
            { icon: TrendingUp, text: "Grow Your Business" },
            { icon: Shield, text: "Verified & Trusted" }
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              <item.icon size={18} color="#fbbf24" />
              {item.text}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          href="/register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 40px',
            background: 'white',
            color: '#92400e',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '1.125rem',
            textDecoration: 'none',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span>Register as Professional</span>
          <ArrowRight size={20} />
        </Link>

        <p style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
          Free registration • No hidden charges
        </p>

      </div>
    </section>
  );
}