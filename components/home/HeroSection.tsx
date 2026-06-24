"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Mail, Shield, Hammer, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '100px 20px',
      background: 'linear-gradient(135deg, #fff8f0 0%, #fef3c7 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Background Decoration */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        background: 'rgba(217, 119, 6, 0.1)',
        borderRadius: '50%',
        blur: '100px'
      }} />
      
      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '60px',
          alignItems: 'center'
        }}>
          
          {/* LEFT CONTENT */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(251, 191, 36, 0.2)',
              border: '2px solid #fbbf24',
              borderRadius: '50px',
              marginBottom: '24px',
              fontWeight: '600',
              color: '#92400e'
            }}>
              <Shield size={18} color="#d97706" />
              <span>Alcazo - Trusted Local Experts in Karnal</span>
            </div>

            {/* Heading */}
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              lineHeight: '1.1',
              marginBottom: '24px',
              color: '#111827'
            }}>
              Expert
              <br />
              <span style={{ color: '#d97706' }}>Carpentry &</span>
              <br />
              Home Services
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              Professional carpenters, plumbers, electricians and skilled workers at your doorstep in Karnal. Quality craftsmanship guaranteed.
            </p>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '48px'
            }}>
              <Link 
                href="/book-service"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                  boxShadow: '0 10px 30px rgba(217, 119, 6, 0.3)',
                  transition: 'all 0.3s ease',
                  width: 'fit-content'
                }}
              >
                <span>Book a Service</span>
                <ArrowRight size={20} />
              </Link>
              
              <Link 
                href="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  background: 'white',
                  color: '#d97706',
                  border: '2px solid #d97706',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  width: 'fit-content'
                }}
              >
                Become a Professional
              </Link>
            </div>

            {/* Contact Info */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              paddingTop: '32px',
              borderTop: '2px solid rgba(217, 119, 6, 0.2)'
            }}>
              <a href="tel:9050951046" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Phone size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Call Us</div>
                  <div>9050951046</div>
                </div>
              </a>
              
              <a href="mailto:sakibfatih107@gmail.com" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Email Us</div>
                  <div>sakibfatih107@gmail.com</div>
                </div>
              </a>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: '0',
              background: 'linear-gradient(135deg, #fcd34d, #fbbf24)',
              borderRadius: '24px',
              transform: 'rotate(3deg)',
              opacity: '0.3'
            }} />
            
            <div style={{
              position: 'relative',
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              border: '2px solid rgba(217, 119, 6, 0.2)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1611486212557-88be5ff6f9ca?w=800"
                alt="Professional carpenter"
                style={{
                  width: '100%',
                  borderRadius: '16px',
                  objectFit: 'cover'
                }}
              />
              
              {/* Floating Badge */}
              <div style={{
                position: 'absolute',
                bottom: '-24px',
                left: '-24px',
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '2px solid rgba(217, 119, 6, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Hammer size={28} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#111827' }}>Expert Craftsmen</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Skilled & Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
