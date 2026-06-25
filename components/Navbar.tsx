"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Hammer, Home, Briefcase, Users, Calendar, User, LogOut, Shield } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    setIsOpen(false);
    router.push("/");
  };

  const isAdmin = user?.email === "sakibfatih107@gmail.com";

  return (
    <>
      {/* ✅ Mobile Menu Overlay - Full Screen */}
      {isOpen && isMobile && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: '80px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '2px solid rgba(217, 119, 6, 0.2)' : '1px solid rgba(217, 119, 6, 0.1)',
        boxShadow: scrolled ? '0 4px 20px rgba(217, 119, 6, 0.1)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '80px'
          }}>
            
            {/* Logo */}
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
              }}>
                <Hammer size={24} color="white" />
              </div>
              <div>
                <h1 style={{
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
                  fontWeight: '800',
                  color: '#111827',
                  margin: 0,
                  lineHeight: 1.2
                }}>
                  Alcazo
                </h1>
                {!isMobile && (
                  <p style={{
                    fontSize: '0.7rem',
                    color: '#d97706',
                    margin: 0,
                    fontWeight: '600'
                  }}>
                    Expert Home Services
                  </p>
                )}
              </div>
            </Link>

            {/* Desktop Navigation - Only on Desktop */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link href="/" style={desktopLinkStyle}>
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                <Link href="/services" style={desktopLinkStyle}>
                  <Briefcase size={18} />
                  <span>Services</span>
                </Link>
                <Link href="/book-service" style={desktopLinkStyle}>
                  <Calendar size={18} />
                  <span>Book Service</span>
                </Link>

                {user ? (
                  <>
                    {isAdmin && (
                      <Link href="/admin" style={adminButtonStyle}>
                        <Shield size={18} />
                        <span>Admin</span>
                      </Link>
                    )}
                    <Link
                      href={userData?.role === "professional" ? "/professional-dashboard" : "/dashboard"}
                      style={dashboardButtonStyle}
                    >
                      <User size={18} />
                      <span>{userData?.name ? userData.name.split(' ')[0] : "Dashboard"}</span>
                    </Link>
                    <button onClick={handleLogout} style={logoutButtonStyle}>
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" style={loginButtonStyle}>
                      <User size={18} />
                      <span>Login</span>
                    </Link>
                    <Link href="/register" style={registerButtonStyle}>
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Button - Always Visible */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                display: 'flex',
                width: '44px',
                height: '44px',
                background: 'rgba(217, 119, 6, 0.1)',
                border: '2px solid rgba(217, 119, 6, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {isOpen ? <X size={24} color="#d97706" /> : <Menu size={24} color="#d97706" />}
            </button>
          </div>
        </div>

        {/* ✅ Mobile Menu - FIXED: Position Absolute, Full Width */}
        {isOpen && isMobile && (
          <div style={{
            position: 'absolute',
            top: '80px',
            left: 0,
            right: 0,
            background: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            borderBottom: '2px solid rgba(217, 119, 6, 0.2)',
            zIndex: 1001,
            padding: '16px 20px',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto'
          }}>
            {/* Common Links */}
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)} 
              style={mobileLinkStyle}
            >
              <Home size={20} color="#d97706" />
              <span>Home</span>
            </Link>

            <Link 
              href="/services" 
              onClick={() => setIsOpen(false)} 
              style={mobileLinkStyle}
            >
              <Briefcase size={20} color="#d97706" />
              <span>Services</span>
            </Link>

            <Link 
              href="/book-service" 
              onClick={() => setIsOpen(false)} 
              style={mobileLinkStyle}
            >
              <Calendar size={20} color="#d97706" />
              <span>Book a Service</span>
            </Link>

            <Link 
              href="/register" 
              onClick={() => setIsOpen(false)} 
              style={mobileLinkStyle}
            >
              <Briefcase size={20} color="#d97706" />
              <span>Become a Professional</span>
            </Link>

            {/* Divider */}
            <div style={{ 
              height: '2px', 
              background: 'linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.3), transparent)', 
              margin: '16px 0' 
            }} />

            {/* Conditional Auth Buttons */}
            {user ? (
              <>
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    onClick={() => setIsOpen(false)} 
                    style={{
                      ...mobileLinkStyle,
                      background: '#111827',
                      color: 'white',
                      fontWeight: '700'
                    }}
                  >
                    <Shield size={20} color="white" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link
                  href={userData?.role === "professional" ? "/professional-dashboard" : "/dashboard"}
                  onClick={() => setIsOpen(false)}
                  style={{
                    ...mobileLinkStyle,
                    color: '#d97706',
                    border: '2px solid #d97706',
                    fontWeight: '700',
                    background: 'rgba(217, 119, 6, 0.05)'
                  }}
                >
                  <User size={20} color="#d97706" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={() => handleLogout()}
                  style={{
                    ...mobileLinkStyle,
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <LogOut size={20} color="#dc2626" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  style={{
                    ...mobileLinkStyle,
                    color: '#d97706',
                    border: '2px solid #d97706',
                    fontWeight: '700',
                    background: 'rgba(217, 119, 6, 0.05)'
                  }}
                >
                  <User size={20} color="#d97706" />
                  <span>Login</span>
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  style={{
                    ...mobileLinkStyle,
                    background: 'linear-gradient(135deg, #d97706, #b45309)',
                    color: 'white',
                    fontWeight: '700',
                    border: 'none'
                  }}
                >
                  <User size={20} color="white" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

// Styles
const desktopLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 16px',
  color: '#374151',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '0.95rem',
  borderRadius: '10px',
  transition: 'all 0.3s ease'
};

const adminButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: '#111827',
  color: 'white',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '0.95rem',
  borderRadius: '10px'
};

const dashboardButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  color: '#d97706',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '0.95rem',
  border: '2px solid #d97706',
  borderRadius: '10px'
};

const logoutButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  background: '#fee2e2',
  color: '#dc2626',
  border: '2px solid #fee2e2',
  fontWeight: '700',
  fontSize: '0.95rem',
  borderRadius: '10px',
  cursor: 'pointer'
};

const loginButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  color: '#d97706',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '0.95rem',
  border: '2px solid #d97706',
  borderRadius: '10px'
};

const registerButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #d97706, #b45309)',
  color: 'white',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '0.95rem',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
};

const mobileLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 20px',
  color: '#374151',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '1.05rem',
  borderRadius: '12px',
  marginBottom: '8px',
  transition: 'all 0.3s ease',
  border: '1px solid transparent'
};
