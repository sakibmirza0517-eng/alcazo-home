"use client";

import { getDocs, query, where, collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
      // Firestore mein data save karo
      await addDoc(collection(db, "professionals"), {
        ...formData,
        status: "approved", // Admin add kar raha hai, isliye direct approved
        isActive: true,
        addedBy: "admin",
        createdAt: serverTimestamp()
      });

      alert("✅ Professional added successfully! Live on website.");
      
      // Form reset karo
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
        {/* Name */}
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

        {/* Phone */}
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

        {/* Category */}
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

        {/* Skills */}
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

        {/* Location */}
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

        {/* Submit Button */}
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

// Input Style (Isko bhi file ke sabse niche add kar de)
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

function ManageProsTab() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Data fetch karna jab tab open ho
  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        // Sirf approved professionals fetch karo
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

  // Professional ko Hide/Deactivate karna
  const handleDeactivate = async (id: string, currentStatus: boolean) => {
    if (!window.confirm("Kya aap is professional ko website se hide karna chahte hain?")) return;
    
    try {
      await updateDoc(doc(db, "professionals", id), { isActive: !currentStatus });
      alert("✅ Status updated successfully!");
      // List refresh karne ke liye page reload (simple tareeka)
      window.location.reload(); 
    } catch (error) {
      console.error("Error updating status:", error);
      alert("❌ Failed to update status.");
    }
  };

  // Professional ko Delete karna
  const handleDelete = async (id: string) => {
    if (!window.confirm("⚠️ WARNING: Kya aap is professional ko hamesha ke liye DELETE karna chahte hain? Ye action undo nahi hoga!")) return;
    
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
        Total Approved: {professionals.length} | Yahan se aap workers ko hide ya delete kar sakte hain.
      </p>

      {professionals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
          <p style={{ color: '#9ca3af' }}>Koi approved professional nahi mila.</p>
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
