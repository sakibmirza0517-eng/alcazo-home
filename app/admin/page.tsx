"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  doc, getDoc, collection, addDoc, serverTimestamp, 
  getDocs, query, where, updateDoc, deleteDoc 
} from "firebase/firestore";
import { 
  LayoutDashboard, UserPlus, Users, Clock, UserCheck, 
  LogOut, Hammer, Shield, AlertCircle, Briefcase, ArrowLeft 
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else if (currentUser.email !== "sakibfatih107@gmail.com") {
        alert("Access Denied! You are not an admin.");
        router.push("/");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "add", label: "Add Professional", icon: UserPlus },
    { id: "manage", label: "Manage Pros", icon: Users },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "users", label: "Users", icon: UserCheck },
  ];

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
  
  {/* Right Side - Back to Home + Logout */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <Link 
      href="/" 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'white',
        color: '#d97706',
        border: '2px solid #d97706',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'all 0.3s ease'
      }}
    >
      <ArrowLeft size={16} /> Back to Home
    </Link>

    <button onClick={handleLogout} style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
      background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px',
      fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'
    }}>
      <LogOut size={16} /> Logout
    </button>
  </div>
</header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
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

// DASHBOARD TAB
// DASHBOARD TAB - WITH REAL DATA
function DashboardTab() {
  const [stats, setStats] = useState({
    totalProfessionals: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Total Professionals (Approved)
        const prosQuery = query(collection(db, "professionals"), where("status", "==", "approved"));
        const prosSnapshot = await getDocs(prosQuery);
        
        // Pending Approvals
        const pendingQuery = query(collection(db, "professionals"), where("status", "==", "pending"));
        const pendingSnapshot = await getDocs(pendingQuery);
        
        // Total Users
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        
        // Total Bookings (if collection exists)
        let bookingsCount = 0;
        try {
          const bookingsQuery = query(collection(db, "bookings"));
          const bookingsSnapshot = await getDocs(bookingsQuery);
          bookingsCount = bookingsSnapshot.size;
        } catch (error) {
          console.log("Bookings collection not found or empty");
        }

        setStats({
          totalProfessionals: prosSnapshot.size,
          pendingApprovals: pendingSnapshot.size,
          totalUsers: usersSnapshot.size,
          totalBookings: bookingsCount
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <p style={{textAlign: 'center', color: '#6b7280'}}>Loading dashboard...</p>;
  }

  const statCards = [
    { 
      title: 'Total Professionals', 
      value: stats.totalProfessionals, 
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fcd34d'
    },
    { 
      title: 'Pending Approvals', 
      value: stats.pendingApprovals, 
      color: '#dc2626',
      bg: '#fee2e2',
      border: '#fca5a5'
    },
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      color: '#2563eb',
      bg: '#dbeafe',
      border: '#93c5fd'
    },
    { 
      title: 'Total Bookings', 
      value: stats.totalBookings, 
      color: '#16a34a',
      bg: '#dcfce7',
      border: '#86efac'
    }
  ];

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '20px' }}>
        Dashboard Overview
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            style={{ 
              padding: '24px', 
              background: stat.bg, 
              borderRadius: '16px', 
              border: `2px solid ${stat.border}`,
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <p style={{ 
              color: stat.color, 
              fontSize: '0.9rem', 
              fontWeight: '700', 
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {stat.title}
            </p>
            <h3 style={{ 
              fontSize: '3rem', 
              fontWeight: '800', 
              color: stat.color, 
              margin: 0,
              lineHeight: 1
            }}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '32px', padding: '24px', background: '#f9fafb', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => document.querySelector('[data-tab="add"]')?.click()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            + Add Professional
          </button>
          <button 
            onClick={() => document.querySelector('[data-tab="pending"]')?.click()}
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#d97706',
              border: '2px solid #d97706',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            View Pending ({stats.pendingApprovals})
          </button>
        </div>
      </div>
    </div>
  );
}

// ADD PROFESSIONAL TAB
function AddProfessionalTab() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    category: "Carpenter",
    skills: "",
    location: "Karnal"
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    "Carpenter", "Plumber", "Electrician", "Painter", 
    "AC Service", "Interior Design", "Furniture Repair", 
    "Pest Control", "Tile & Flooring"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "professionals"), {
        ...formData,
        status: "approved",
        isActive: true,
        addedBy: "admin",
        createdAt: serverTimestamp()
      });

      alert("✅ Professional added successfully! Live on website.");
      
      setFormData({
        name: "",
        phone: "",
        category: "Carpenter",
        skills: "",
        location: "Karnal"
      });
    } catch (error) {
      console.error("Error adding professional:", error);
      alert("❌ Failed to add professional. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
        Add New Professional
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>
        Fill the details below. This professional will be directly approved and visible on the website.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Rahul Sharma"
          style={inputStyle}
        />

        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="e.g. 9876543210"
          style={inputStyle}
        />

        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Service Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          style={inputStyle}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Skills / Experience</label>
        <textarea
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          required
          placeholder="e.g. 5 years experience in modular furniture..."
          rows={3}
          style={{...inputStyle, resize: 'vertical'}}
        />

        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          placeholder="e.g. Karnal, Sector 12"
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #d97706, #b45309)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px',
            boxShadow: '0 8px 20px rgba(217, 119, 6, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? "Adding Professional..." : "Add & Approve Professional"}
        </button>
      </form>
    </div>
  );
}

// MANAGE PROFESSIONALS TAB
function ManageProsTab() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "professionals"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        
        const prosList: any[] = [];
        querySnapshot.forEach((doc) => {
          prosList.push({ id: doc.id, ...doc.data() });
        });
        setProfessionals(prosList);
      } catch (error) {
        console.error("Error fetching professionals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  const handleDeactivate = async (id: string, currentStatus: boolean) => {
    if (!window.confirm("Kya aap is professional ko website se hide karna chahte hain?")) return;
    
    try {
      await updateDoc(doc(db, "professionals", id), { isActive: !currentStatus });
      alert("✅ Status updated successfully!");
      window.location.reload(); 
    } catch (error) {
      console.error("Error updating status:", error);
      alert("❌ Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("⚠️ WARNING: Kya aap is professional ko hamesha ke liye DELETE karna chahte hain?")) return;
    
    try {
      await deleteDoc(doc(db, "professionals", id));
      alert("🗑️ Professional deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting professional:", error);
      alert("❌ Failed to delete.");
    }
  };

  if (loading) return <p style={{textAlign: 'center', color: '#6b7280'}}>Loading professionals...</p>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
        Manage Professionals
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>
        Total Approved: {professionals.length}
      </p>

      {professionals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
          <p style={{ color: '#9ca3af' }}>Koi approved professional nahi mila. Pehle "Add Professional" tab se add karein.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {professionals.map((pro) => (
            <div key={pro.id} style={{
              background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px',
              padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#111827', margin: 0 }}>{pro.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: '600', margin: '4px 0 0' }}>{pro.category}</p>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                  background: pro.isActive ? '#dcfce7' : '#fee2e2',
                  color: pro.isActive ? '#166534' : '#991b1b'
                }}>
                  {pro.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>📞 {pro.phone}</p>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px', lineHeight: '1.4' }}>🛠️ {pro.skills}</p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleDeactivate(pro.id, pro.isActive)}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                    background: pro.isActive ? '#fef3c7' : '#dcfce7',
                    color: pro.isActive ? '#92400e' : '#166534',
                    fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  {pro.isActive ? 'Hide' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(pro.id)}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                    background: '#fee2e2', color: '#dc2626',
                    fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// PENDING APPROVALS TAB
function PendingTab() {
  const [pendingPros, setPendingPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "professionals"), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        
        const prosList: any[] = [];
        querySnapshot.forEach((doc) => {
          prosList.push({ id: doc.id, ...doc.data() });
        });
        setPendingPros(prosList);
      } catch (error) {
        console.error("Error fetching pending professionals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm("Kya aap is professional ko approve karna chahte hain? Wo website par live ho jayega.")) return;
    
    try {
      await updateDoc(doc(db, "professionals", id), { 
        status: "approved",
        isActive: true,
        approvedAt: serverTimestamp()
      });
      alert("✅ Professional approved successfully!");
      window.location.reload(); 
    } catch (error) {
      console.error("Error approving professional:", error);
      alert("❌ Failed to approve.");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Kya aap is professional ki request reject karna chahte hain?")) return;
    
    try {
      await updateDoc(doc(db, "professionals", id), { status: "rejected" });
      alert("❌ Professional rejected.");
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting professional:", error);
      alert("❌ Failed to reject.");
    }
  };

  if (loading) return <p style={{textAlign: 'center', color: '#6b7280'}}>Loading pending requests...</p>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
        Pending Approvals
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>
        Total Pending Requests: {pendingPros.length}
      </p>

      {pendingPros.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
          <p style={{ color: '#9ca3af' }}>Koi pending request nahi hai. Sab clear hai!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {pendingPros.map((pro) => (
            <div key={pro.id} style={{
              background: 'white', border: '2px solid #fef3c7', borderRadius: '16px',
              padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#111827', margin: 0 }}>{pro.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: '600', margin: '4px 0 0' }}>{pro.category}</p>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                  background: '#fef3c7', color: '#92400e'
                }}>
                  Pending
                </span>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>📞 {pro.phone}</p>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px', lineHeight: '1.4' }}>🛠️ {pro.skills}</p>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '16px' }}>📍 {pro.location}</p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleApprove(pro.id)}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                    background: '#dcfce7', color: '#166534',
                    fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleReject(pro.id)}
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                    background: '#fee2e2', color: '#dc2626',
                    fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// USERS TAB
// USERS TAB - Registered Customers
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        
        const usersList: any[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    const action = currentBlocked ? "unblock" : "block";
    if (!window.confirm(`Kya aap is user ko ${action} karna chahte hain?`)) return;
    
    try {
      await updateDoc(doc(db, "users", userId), { 
        isBlocked: !currentBlocked 
      });
      alert(`✅ User ${action === "block" ? "blocked" : "unblocked"} successfully!`);
      window.location.reload(); 
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("❌ Failed to update user status.");
    }
  };

  if (loading) return <p style={{textAlign: 'center', color: '#6b7280'}}>Loading users...</p>;

  const customers = users.filter(u => u.role === "customer");
  const professionals = users.filter(u => u.role === "professional");

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
        Registered Users
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>
        Total Users: {users.length} | Customers: {customers.length} | Professionals: {professionals.length}
      </p>

      {/* Customers Section */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#d97706', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={20} />
          Customers ({customers.length})
        </h3>

        {customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', background: '#f9fafb', borderRadius: '12px' }}>
            <p style={{ color: '#9ca3af' }}>Abhi tak koi customer register nahi hua.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {customers.map((user) => (
              <div key={user.id} style={{
                background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
                padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', margin: 0 }}>{user.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0' }}>{user.email}</p>
                  </div>
                  {user.isBlocked && (
                    <span style={{
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700',
                      background: '#fee2e2', color: '#dc2626'
                    }}>
                      Blocked
                    </span>
                  )}
                </div>
                
                <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>📞 {user.phone}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '12px' }}>
                  Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>

                <button
                  onClick={() => handleToggleBlock(user.id, user.isBlocked || false)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: 'none',
                    borderRadius: '8px',
                    background: user.isBlocked ? '#dcfce7' : '#fee2e2',
                    color: user.isBlocked ? '#166534' : '#dc2626',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {user.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Professionals Section - WITH BLOCK BUTTON */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#d97706', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={20} />
          Professionals ({professionals.length})
        </h3>

        {professionals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', background: '#f9fafb', borderRadius: '12px' }}>
            <p style={{ color: '#9ca3af' }}>Abhi tak koi professional register nahi hua.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {professionals.map((user) => (
              <div key={user.id} style={{
                background: 'white', border: '1px solid #fcd34d', borderRadius: '12px',
                padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', margin: 0 }}>{user.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0' }}>{user.email}</p>
                  </div>
                  {user.isBlocked && (
                    <span style={{
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700',
                      background: '#fee2e2', color: '#dc2626'
                    }}>
                      Blocked
                    </span>
                  )}
                </div>
                
                <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>📞 {user.phone}</p>
                <p style={{ fontSize: '0.85rem', color: '#d97706', marginBottom: '8px', fontWeight: '600' }}>
                  🔧 {user.service || 'Not specified'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '12px' }}>
                  Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>

                <button
                  onClick={() => handleToggleBlock(user.id, user.isBlocked || false)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: 'none',
                    borderRadius: '8px',
                    background: user.isBlocked ? '#dcfce7' : '#fee2e2',
                    color: user.isBlocked ? '#166534' : '#dc2626',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {user.isBlocked ? 'Unblock Professional' : 'Block Professional'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// INPUT STYLE
const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '2px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '16px',
  background: '#fafafa',
  transition: 'border 0.3s ease'
};
