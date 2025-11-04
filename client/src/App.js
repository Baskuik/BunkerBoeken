import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import ContactPage from "./ContactPage";
import VerhaalPage from "./VerhaalPage";
import InfomatiePage from "./InfomatiePage";
import BetaalPage from "./BetaalPage";
import BookingPage from "./BookingPage";
import BookingConfirmPage from "./BookingConfirmPage";
import AdminLoginPage from "./AdminLoginPage";
import DashboardPage from "./DashboardPage";
import PrivateAdminRoute from "./PrivateAdminRoute";
import AdminAccountPage from "./AdminAccountPage";
import StatistiekenPage from "./StatistiekenPage";
import BevestigingsmailPage from "./BevestigingsmailPage";
import KostenPage from "./KostenPage";
import MaxPersoonPage from "./MaxPersoonPage";
import ReserveringInzienPage from "./ReserveringInzienPage";
import RondLeidingToevoegenPage from "./RondLeidingToevoegenPage";
import InzienPage from "./InzienPage";
import BewerkenPage from "./BewerkenPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/verhaal" element={<VerhaalPage />} />
        <Route path="/BetaalPage" element={<BetaalPage />} />
        <Route path="/InfomatiePage" element={<InfomatiePage />} />
        <Route path="/boeken" element={<BookingPage />} />
        <Route path="/booking-confirm/:id" element={<BookingConfirmPage />} />
        <Route path="/adminlogin" element={<AdminLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateAdminRoute>
              <DashboardPage />
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
          path="/bevestigingsmail"
          element={
            <PrivateAdminRoute>
              <BevestigingsmailPage />
            </PrivateAdminRoute>
          }
        />
        <Route
          path="/kosten"
          element={
            <PrivateAdminRoute>
              <KostenPage />
            </PrivateAdminRoute>
          }
        />
        <Route
          path="/maxpersonen"
          element={
            <PrivateAdminRoute>
              <MaxPersoonPage />
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
        <Route
          path="/rondleiding-toevoegen"
          element={
            <PrivateAdminRoute>
              <RondLeidingToevoegenPage />
            </PrivateAdminRoute>
          }
        />
        <Route
          path="/bewerken"
          element={
            <PrivateAdminRoute>
              <BewerkenPage />
            </PrivateAdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
