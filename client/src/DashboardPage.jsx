import React from "react";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
        } catch (err) {
            // ignore errors, navigatie alsnog uitvoeren
        } finally {
            navigate("/adminlogin");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-6">
            <h1 className="text-3xl font-bold text-gray-700">Welkom bij het Admin Dashboard 🎉</h1>
            <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
            >
                Uitloggen
            </button>
        </div>
    );
}

export default DashboardPage;
