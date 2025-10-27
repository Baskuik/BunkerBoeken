import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import AdminLoginPage from "./AdminLoginPage";
import DashboardPage from "./DashboardPage";
import PrivateAdminRoute from "./PrivateAdminRoute";
import BookingPage from "./BookingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/boeken" element={<BookingPage />} />
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
