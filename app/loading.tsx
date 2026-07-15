export default function Loading() {
  return (
    <div style={styles.container}>
      {/* Beautiful Spinning Loader */}
      <div style={styles.spinnerWrapper}>
        <div style={styles.spinnerOuter}></div>
        <div style={styles.spinnerInner}></div>
        <div style={styles.logoIcon}>
          {/* Hammer Icon (Alcazo Brand) */}
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
            <path d="M17.64 15 22 10.64" />
            <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
          </svg>
        </div>
      </div>

      {/* Brand Name & Text */}
      <h1 style={styles.brandName}>Alcazo</h1>
      <p style={styles.loadingText}>Preparing your experience...</p>

      {/* CSS Animations */}
      <style>{`
        @keyframes spinOuter {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinInner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ✅ Beautiful Inline Styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fff8f0 0%, #fef3c7 100%)', // Matches your Hero section
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  spinnerWrapper: {
    position: 'relative' as const,
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  spinnerOuter: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '4px solid transparent',
    borderTopColor: '#d97706', // Amber-600
    borderRightColor: '#d97706',
    animation: 'spinOuter 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
  },
  spinnerInner: {
    position: 'absolute' as const,
    width: '70%',
    height: '70%',
    borderRadius: '50%',
    border: '4px solid transparent',
    borderBottomColor: '#b45309', // Amber-700
    borderLeftColor: '#b45309',
    animation: 'spinInner 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
  },
  logoIcon: {
    position: 'absolute' as const,
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  brandName: {
    margin: '0 0 8px 0',
    fontSize: '2rem',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.02em',
    animation: 'fadeIn 0.8s ease-out',
  },
  loadingText: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#6b7280',
    fontWeight: '500',
    animation: 'fadeIn 1s ease-out',
  },
};