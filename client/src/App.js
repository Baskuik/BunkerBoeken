import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import ContactPage from "./ContactPage";
import VerhaalPage from "./VerhaalPage";
import InfomatiePage from "./InfomatiePage";
import BetaalPage from "./BetaalPage";
import AdminLoginPage from "./AdminLoginPage";
import DashboardPage from "./DashboardPage";
import PrivateAdminRoute from "./PrivateAdminRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/HomePage" element={<HomePage />} />`
        <Route path="/ContactPage" element={<ContactPage />} />
        <Route path="/VerhaalPage" element={<VerhaalPage />} />
        <Route path="/BetaalPage" element={<BetaalPage />} />
        <Route path="/InfomatiePage" element={<InfomatiePage />} />
        <Route path="/adminlogin" element={<AdminLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateAdminRoute>
              <DashboardPage />
            </PrivateAdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
