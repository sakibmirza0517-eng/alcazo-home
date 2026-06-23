"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Sun, Moon, Hammer, Home, Briefcase, Users, Calendar, User, LogOut } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Mobile detection
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
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/book-service", label: "Services", icon: Briefcase },
    { href: "/professionals", label: "Professionals", icon: Users },
    { href: "/book-service", label: "Book Service", icon: Calendar },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: scrolled ? 'blur(20px)' : 'blur(10px)',
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

          {/* Desktop Navigation - Sirf desktop pe dikhao */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    border: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(217, 119, 6, 0.1)';
                    e.currentTarget.style.color = '#d97706';
                    e.currentTarget.style.borderColor = 'rgba(217, 119, 6, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Right Side Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Desktop Auth Buttons - Sirf desktop pe dikhao */}
            {!isMobile && (
              <>
                {user ? (
                  <>
                    <Link
                      href={userData?.role === "professional" ? "/professional-dashboard" : "/dashboard"}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        color: '#d97706',
                        textDecoration: 'none',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        border: '2px solid #d97706',
                        borderRadius: '10px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(217, 119, 6, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <User size={18} />
                      <span>{userData?.name ? userData.name.split(' ')[0] : "Dashboard"}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '2px solid #fee2e2',
                        textDecoration: 'none',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fecaca';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                      }}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        color: '#d97706',
                        textDecoration: 'none',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        border: '2px solid #d97706',
                        borderRadius: '10px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(217, 119, 6, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <User size={18} />
                      <span>Login</span>
                    </Link>

                    <Link
                      href="/register"
                      style={{
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
                        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(217, 119, 6, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.3)';
                      }}
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Mobile Menu Button - Hamesha dikhao */}
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
                justifyContent: 'center'
              }}
            >
              {isOpen ? <X size={24} color="#d97706" /> : <Menu size={24} color="#d97706" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Jab isOpen true ho */}
        {isOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '20px 0',
            borderTop: '2px solid rgba(217, 119, 6, 0.2)',
            marginTop: '10px'
          }}>
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  color: '#374151',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  borderRadius: '10px',
                  background: 'transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {user ? (
                <>
                  <Link
                    href={userData?.role === "professional" ? "/professional-dashboard" : "/dashboard"}
                    onClick={() => setIsOpen(false)}
                    style={{
                      padding: '12px 12px',
                      color: '#d97706',
                      textDecoration: 'none',
                      fontWeight: '700',
                      border: '2px solid #d97706',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    style={{
                      padding: '12px 12px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      fontWeight: '700',
                      borderRadius: '10px',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    style={{
                      padding: '12px 12px',
                      color: '#d97706',
                      textDecoration: 'none',
                      fontWeight: '700',
                      border: '2px solid #d97706',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    style={{
                      padding: '12px 12px',
                      background: 'linear-gradient(135deg, #d97706, #b45309)',
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: '700',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}