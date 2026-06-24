"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Hammer } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{
      background: '#111827',
      color: 'white',
      padding: '60px 20px 30px'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Top Section */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '40px',
          marginBottom: '40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '40px'
        }}>
          
          {/* Column 1: Brand */}
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Hammer size={20} color="white" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', margin: 0 }}>Alcazo</h3>
            </div>
            <p style={{ color: '#9ca3af', lineHeight: '1.6', fontSize: '0.95rem', maxWidth: '300px' }}>
              Expert carpentry and home services in Karnal. Connecting you with verified local professionals.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div style={{ flex: '1 1 200px' }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '20px', color: '#fbbf24' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { href: '/', label: 'Home' },
                { href: '/services', label: 'Services' },
                { href: '/book', label: 'Book Service' },
                { href: '/register', label: 'Become a Pro' }
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Contact */}
          <div style={{ flex: '1 1 300px' }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '20px', color: '#fbbf24' }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <a href="tel:9050951046" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#9ca3af', textDecoration: 'none' }}>
                <Phone size={18} color="#fbbf24" />
                <span>9050951046</span>
              </a>
              <a href="mailto:alcazo@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#9ca3af', textDecoration: 'none' }}>
                <Mail size={18} color="#fbbf24" />
                <span>sakibfatih107@gmail.com</span>
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#9ca3af' }}>
                <MapPin size={18} color="#fbbf24" />
                <span>Karnal, Haryana - 132001</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
          <p>© {new Date().getFullYear()} Alcazo. All rights reserved. Made with ❤️ in Karnal.</p>
        </div>

      </div>
    </footer>
  );
}
