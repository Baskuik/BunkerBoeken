// src/PrivateAdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateAdminRoute({ children }) {
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "not"

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/me", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!mounted) return;

        const data = await res.json();

        // Only allow if status is 200 AND we have valid admin data
        if (res.status === 200 && data.adminId && data.role === 'admin') {
          setStatus("ok");
        } else {
          console.log("Auth check failed:", { status: res.status, data });
          setStatus("not");
        }
      } catch (err) {
        console.error("PrivateAdminRoute fetch error:", err);
        if (mounted) setStatus("not");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "ok") return children;

  // Force cookie cleanup on redirect
  if (status === "not") {
    fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include"
    }).catch(console.error);
  }

  return <Navigate to="/adminlogin" replace />;
}