import React from "react";
import { useNavigate } from "react-router-dom";

export default function KostenPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-50 p-6">
            <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-lg p-6 shadow">
                <h1 className="text-2xl font-semibold mb-4">Kosten</h1>
                <p className="text-gray-600 mb-6">Overzicht en instellingen van kosten.</p>
                <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-blue-600 text-white rounded border border-black">
                    Terug naar dashboard
                </button>
            </div>
        </div>
    );
}