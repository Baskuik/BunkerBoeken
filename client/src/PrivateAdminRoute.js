// src/PrivateAdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateAdminRoute({ children }) {
  const [status, setStatus] = useState("loading"); // loading | ok | not

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/me", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!mounted) return;

        const data = await res.json().catch(() => ({}));

        if (res.status === 200 && data && data.adminId) {
          setStatus("ok");
        } else {
          console.log("PrivateAdminRoute: auth failed", res.status, data);
          setStatus("not");
        }
      } catch (err) {
        console.error("PrivateAdminRoute fetch error:", err);
        if (mounted) setStatus("not");
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "ok") return children;

  // status === "not" -> probeer server logout aan te roepen
  fetch("http://localhost:5000/api/logout", { method: "POST", credentials: "include" }).catch(() => {});
  return <Navigate to="/adminlogin" replace />;
}
