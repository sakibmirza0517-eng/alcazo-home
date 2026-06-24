"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  { 
    question: "How do I book a service?", 
    answer: "Simply browse our services, select the one you need, fill in your details, and submit a booking request. We'll match you with a verified professional within minutes." 
  },
  { 
    question: "Are the professionals verified?", 
    answer: "Yes! All professionals on Alcazo go through a strict verification process including skill assessment and background checks." 
  },
  { 
    question: "What areas do you serve?", 
    answer: "We currently serve Karnal and surrounding areas in Haryana. We are expanding to more cities soon!" 
  },
  { 
    question: "How do I pay for the service?", 
    answer: "We accept cash payments. You can pay online or directly to the professional after work completion at your respective site." 
  },
  { 
    question: "What if I'm not satisfied?", 
    answer: "We are working on our website and we will soon add a service and complaint box." 
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
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
            <HelpCircle size={16} color="#d97706" />
            FAQ
          </div>
          
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#111827'
          }}>
            Frequently Asked <span style={{ color: '#d97706' }}>Questions</span>
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Got questions? We've got answers
          </p>
        </div>

        {/* FAQ List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                style={{
                  background: 'white',
                  border: `2px solid ${isOpen ? '#fbbf24' : '#f3f4f6'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: isOpen ? '0 10px 30px rgba(217, 119, 6, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Question Button */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '16px'
                  }}
                >
                  <span style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: isOpen ? '#d97706' : '#111827',
                    transition: 'color 0.3s ease'
                  }}>
                    {faq.question}
                  </span>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: isOpen ? '#fef3c7' : '#f9fafb',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s ease'
                  }}>
                    <ChevronDown 
                      size={20} 
                      color={isOpen ? '#d97706' : '#6b7280'} 
                      style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.3s ease' 
                      }} 
                    />
                  </div>
                </button>

                {/* Answer Content */}
                <div style={{
                  maxHeight: isOpen ? '300px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease, padding 0.4s ease',
                  padding: isOpen ? '0 24px 24px' : '0 24px'
                }}>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.7',
                    fontSize: '1rem',
                    margin: 0
                  }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
