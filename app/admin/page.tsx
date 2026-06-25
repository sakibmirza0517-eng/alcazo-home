"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { 
  LayoutDashboard, UserPlus, Users, Clock, UserCheck, 
  LogOut, Hammer, Shield, AlertCircle 
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // 1. Security & Auth Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else if (currentUser.email !== "sakibfatih107@gmail.com") {
        // Agar koi aur admin panel kholne ki koshish kare
        alert("Access Denied! You are not an admin.");
        router.push("/");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Logout Function
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // 3. Tabs Configuration
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "add", label: "Add Professional", icon: UserPlus },
    { id: "manage", label: "Manage Pros", icon: Users },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "users", label: "Users", icon: UserCheck },
  ];

  // Loading State
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fffbeb', color: '#d97706', fontSize: '1.2rem', fontWeight: '600'
      }}>
        Verifying Admin Access...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingTop: '80px' }}>
      
      {/* Top Header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '80px',
        background: 'white', borderBottom: '2px solid rgba(217, 119, 6, 0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', background: 'linear-gradient(135deg, #d97706, #b45309)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827', margin: 0 }}>Admin Panel</h1>
            <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>Alcazo Control Center</p>
          </div>
        </div>
        
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
          background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px',
          fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'
        }}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        {/* Tabs Navigation (Mobile Friendly - Horizontal Scroll) */}
        <div style={{
          display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px',
          marginBottom: '20px', borderBottom: '2px solid #e5e7eb'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 20px', whiteSpace: 'nowrap',
                background: activeTab === tab.id ? '#d97706' : 'white',
                color: activeTab === tab.id ? 'white' : '#374151',
                border: activeTab === tab.id ? '2px solid #d97706' : '2px solid #e5e7eb',
                borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem',
                cursor: 'pointer', transition: 'all 0.3s ease'
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '30px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6'
        }}>
          
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "add" && <AddProfessionalTab />}
          {activeTab === "manage" && <ManageProsTab />}
          {activeTab === "pending" && <PendingTab />}
          {activeTab === "users" && <UsersTab />}

        </div>
      </div>
    </div>
  );
}

// --- TAB COMPONENTS (Placeholders for now) ---

function DashboardTab() {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '20px' }}>Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {['Total Professionals', 'Pending Approvals', 'Total Users', 'Total Bookings'].map((stat, i) => (
          <div key={i} style={{ padding: '20px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fcd34d' }}>
            <p style={{ color: '#92400e', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>{stat}</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', margin: '10px 0 0' }}>0</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddProfessionalTab() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <UserPlus size={48} color="#d97706" style={{ marginBottom: '16px' }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>Add New Professional</h2>
      <p style={{ color: '#6b7280' }}>Form will be implemented in the next step.</p>
    </div>
  );
}

function ManageProsTab() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Users size={48} color="#d97706" style={{ marginBottom: '16px' }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>Manage Approved Professionals</h2>
      <p style={{ color: '#6b7280' }}>List of professionals will appear here.</p>
    </div>
  );
}

function PendingTab() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Clock size={48} color="#d97706" style={{ marginBottom: '16px' }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>Pending Approvals</h2>
      <p style={{ color: '#6b7280' }}>New registration requests will appear here.</p>
    </div>
  );
}

function UsersTab() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <UserCheck size={48} color="#d97706" style={{ marginBottom: '16px' }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>Registered Users</h2>
      <p style={{ color: '#6b7280' }}>Customer list will appear here.</p>
    </div>
  );
}
