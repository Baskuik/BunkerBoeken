// src/components/AdminDashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css"; // ✅ Font Awesome import toegevoegd

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-black p-4 transition-colors ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>{children}</div>
);

const Button = ({ children, variant = "default", size = "md", onClick }) => {
  const base = "font-semibold rounded";
  const variants = {
    default: "bg-blue-600 text-white border border-black hover:bg-blue-700",
    outline: "border border-black text-gray-800 bg-white hover:bg-gray-50",
  };
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.md}`}
    >
      {children}
    </button>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const actions = [
    { title: "Statistieken inzien" },
    { title: "Bevestigingsmail" },
    { title: "Kosten" },
    { title: "Maximaal aantal personen & openingstijden" },
    { title: "Reserveringen inzien" },
    { title: "Rondleiding toevoegen" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      // ignore errors
    } finally {
      navigate("/adminlogin");
    }
  };

  // sluit menu bij click buiten of Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white shadow-sm border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded" />
          <span className="font-semibold text-lg">Admin</span>
        </div>

        {/* user icon + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Account menu"
          >
            <i className="fa-solid fa-circle-user text-2xl text-gray-700" aria-hidden="true"></i>
            <span className="sr-only">Open account menu</span>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/account");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-t-lg"
              >
                Account
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-b-lg"
              >
                Uitloggen
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-start py-10">
        <h1 className="text-2xl font-medium mb-8">Wat wilt u vandaag doen?</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full px-6">
          {actions.map((item, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md hover:bg-gray-50">
              <CardContent className="h-32 text-center">
                <span className="text-base font-medium">{item.title}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
