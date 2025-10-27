import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminAccountPage() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        const fetchMe = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/me", {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    if (mounted) setAdmin(data);
                } else if (res.status === 401) {
                    // niet ingelogd -> terug naar login
                    navigate("/adminlogin");
                } else {
                    const d = await res.json().catch(() => ({}));
                    throw new Error(d.message || "Kon gegevens niet laden");
                }
            } catch (err) {
                if (mounted) setError(err.message || "Fout bij laden");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchMe();
        return () => {
            mounted = false;
        };
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
        } catch (e) {
            // ignore
        } finally {
            navigate("/adminlogin");
        }
    };

    if (loading) return <div className="p-6">Laden...</div>;
    if (error) return <div className="p-6 text-red-600">Fout: {error}</div>;

    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">Accountgegevens</h2>

                <div className="mb-3">
                    <label className="block text-sm text-gray-600">Admin ID</label>
                    <div className="mt-1 p-3 bg-gray-100 rounded">{admin?.adminId ?? "Onbekend"}</div>
                </div>

                <div className="mb-3">
                    <label className="block text-sm text-gray-600">E-mailadres</label>
                    <div className="mt-1 p-3 bg-gray-100 rounded">{admin?.email ?? "Onbekend"}</div>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 bg-blue-600 text-white rounded border border-black hover:bg-blue-700"
                    >
                        Terug naar dashboard
                    </button>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-white text-gray-800 rounded border border-black hover:bg-gray-50"
                    >
                        Uitloggen
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminAccountPage;