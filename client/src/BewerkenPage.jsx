// src/components/BewerkenPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BewerkenPage() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(`/bewerken/${path}`);
  };

  // Tijdelijke knop om website te openen met admin rechten en editMode
  const handleGoToWebsite = () => {
    navigate("/boeken", { state: { admin: true, editMode: true } }); 
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Wat wilt u vandaag bewerken?</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleNavigate("bevestigingsmail")}
          className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Bevestigingsmail
        </button>

        <button
          onClick={() => handleNavigate("kosten")}
          className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Kosten
        </button>

        <button
          onClick={() => handleNavigate("maxpersonen")}
          className="px-4 py-3 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Max personen
        </button>

        <button
          onClick={() => handleNavigate("rondleidingen")}
          className="px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Rondleidingen
        </button>

        <button
          onClick={() => handleNavigate("openingstijd")}
          className="px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Openingstijd
        </button>

        <button
          onClick={() => handleNavigate("boekingen")}
          className="px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Boekingen
        </button>

        {/* Tijdelijke knop om website te openen */}
        <button
          onClick={handleGoToWebsite}
          className="px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 col-span-full"
        >
          Ga naar website
        </button>
      </div>
    </div>
  );
}
