// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./AdminContext";

import HomePage from "./HomePage";
import ContactPage from "./ContactPage";
import VerhaalPage from "./VerhaalPage";
import BookingPage from "./BookingPage";
import BookingConfirmPage from "./BookingConfirmPage";
import AdminLoginPage from "./AdminLoginPage";
import DashboardPage from "./DashboardPage";
import PrivateAdminRoute from "./PrivateAdminRoute";
import AdminAccountPage from "./AdminAccountPage";
import StatistiekenPage from "./StatistiekenPage";
import BewerkenPage from "./BewerkenPage";
import BevestigingsmailPage from "./BevestigingsmailPage";
import KostenPage from "./KostenPage";
import MaxPersoonPage from "./MaxPersoonPage";
import RondLeidingToevoegenPage from "./RondLeidingToevoegenPage";
import ReserveringInzienPage from "./ReserveringInzienPage";
import InzienPage from "./InzienPage";

function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          {/* Publieke pagina's */}
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/verhaal" element={<VerhaalPage />} />
          <Route path="/boeken" element={<BookingPage />} />
          <Route path="/booking-confirm/:id" element={<BookingConfirmPage />} />
          <Route path="/adminlogin" element={<AdminLoginPage />} />

          {/* Admin dashboard en routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateAdminRoute>
                <DashboardPage />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateAdminRoute>
                <AdminAccountPage />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/statistieken"
            element={
              <PrivateAdminRoute>
                <StatistiekenPage />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/inzien"
            element={
              <PrivateAdminRoute>
                <InzienPage />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/reserveringen"
            element={
              <PrivateAdminRoute>
                <ReserveringInzienPage />
              </PrivateAdminRoute>
            }
          />

          {/* Admin bewerken overzicht */}
          <Route
            path="/bewerken"
            element={
              <PrivateAdminRoute>
                <BewerkenPage />
              </PrivateAdminRoute>
            }
          />

          {/* Subpagina's van bewerken */}
          <Route
            path="/bewerken/bevestigingsmail"
            element={
              <PrivateAdminRoute>
                <BevestigingsmailPage />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/bewerken/kosten"
            element={
              <PrivateAdminRoute>
                <KostenPage />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/bewerken/maxpersonen"
            element={
              <PrivateAdminRoute>
                <MaxPersoonPage />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/bewerken/rondleidingen"
            element={
              <PrivateAdminRoute>
                <RondLeidingToevoegenPage />
              </PrivateAdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<div className="p-6">Pagina niet gevonden</div>} />
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;
