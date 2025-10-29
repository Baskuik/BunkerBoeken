import React, { useEffect, useState } from "react";

export default function InzienPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [view, setView] = useState("future"); // future | all
    const [sortAsc, setSortAsc] = useState(true);

    const fetchBookings = async () => {
        setLoading(true);
        setError("");
        try {
            const q = view === "future" ? "?future=true" : "";
            const res = await fetch(`http://localhost:5000/api/bookings${q}`, { credentials: "include" });
            if (!res.ok) throw new Error("Kon reserveringen niet ophalen");
            const data = await res.json();
            setList(data);
        } catch (err) {
            setError(err.message || "Fout");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [view]);

    const sorted = [...list].sort((a, b) => {
        const da = `${a.date} ${a.time}`, db = `${b.date} ${b.time}`;
        return sortAsc ? da.localeCompare(db) : db.localeCompare(da);
    });

    if (loading) return <div className="p-6">Laden...</div>;
    if (error) return <div className="p-6 text-red-600">Fout: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto bg-white rounded border p-6 shadow">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold">Reserveringen inzien</h1>
                    <div className="flex items-center gap-3">
                        <label className="text-sm">Weergave:</label>
                        <select value={view} onChange={(e) => setView(e.target.value)} className="border px-2 py-1 rounded">
                            <option value="future">Toekomstige reserveringen</option>
                            <option value="all">Alle reserveringen</option>
                        </select>
                        <button onClick={() => setSortAsc((s) => !s)} className="px-3 py-1 border rounded">
                            Sorteer {sortAsc ? "▲" : "▼"}
                        </button>
                        <button onClick={fetchBookings} className="px-3 py-1 border rounded">Vernieuwen</button>
                    </div>
                </div>

                {sorted.length === 0 ? (
                    <p className="text-gray-600">Geen reserveringen gevonden.</p>
                ) : (
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="py-2">Datum</th>
                                <th>Tijd</th>
                                <th>Naam</th>
                                <th>E-mail</th>
                                <th>Aantal</th>
                                <th>Prijs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((b) => (
                                <tr key={b.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2">{b.date}</td>
                                    <td>{b.time}</td>
                                    <td>{b.name}</td>
                                    <td>{b.email}</td>
                                    <td>{b.people}</td>
                                    <td>€{Number(b.prijs).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}