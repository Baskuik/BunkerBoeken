import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";

export default function BookingConfirmPage() {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state && location.state.booking ? location.state.booking : null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchBooking() {
      if (booking) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/bookings/${id}`);
        if (!res.ok) throw new Error("Niet gevonden");
        const data = await res.json();
        if (mounted) setBooking(data);
      } catch (err) {
        if (mounted) setError("Kon de boeking niet laden.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    // only fetch if we don't have booking data from navigation state
    fetchBooking();
    return () => (mounted = false);
  }, [id, booking]);

  if (loading) return <div className="p-6">Laden…</div>;
  if (error) return <div className="p-6">Fout: {error}</div>;
  if (!booking) return <div className="p-6">Geen boeking gevonden.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-4">Bevestiging boeking</h2>

      <div className="bg-white p-6 rounded shadow space-y-3">
        <p><strong>Bevestigingsnummer:</strong> {booking.id || "nog niet opgeslagen"}</p>
        <p><strong>Naam:</strong> {booking.name}</p>
        <p><strong>E-mail:</strong> {booking.email}</p>
        <p><strong>Datum:</strong> {booking.date}</p>
        <p><strong>Tijd:</strong> {booking.time}</p>
        <p><strong>Aantal personen:</strong> {booking.people}</p>
        <p><strong>Gemaakt op:</strong> {booking.created_at}</p>

        {booking.serverError && (
          <div className="mt-3 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-sm">
            Let op: de boeking kon mogelijk niet naar de server worden opgeslagen: {booking.serverError}
          </div>
        )}

        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-1">Locatie</h3>
          <p>Bunker Museum (voorbeeldadres):</p>
          <p>Hoofdstraat 1, 1234 AB, Plaatsnaam</p>
          <p className="text-sm text-gray-600 mt-2">Let op: dit is een tijdelijke placeholder.</p>
        </div>

        <div className="flex space-x-3 mt-4">
          <Link to="/" className="px-4 py-2 bg-gray-200 rounded">Terug naar home</Link>
          <Link to="/boeken" className="px-4 py-2 bg-blue-600 text-white rounded">Nieuwe boeking</Link>
        </div>
      </div>
    </div>
  );
}